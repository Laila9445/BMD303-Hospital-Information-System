using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using CLINICSYSTEM.Data;
using CLINICSYSTEM.Models;
using CLINICSYSTEM.Services;
using CLINICSYSTEM.Middleware;
using CLINICSYSTEM.Validators;
using CLINICSYSTEM.Extensions;
using CLINICSYSTEM.Repositories;
using FluentValidation;
using FluentValidation.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// ============================================
// SERVICE REGISTRATION
// ============================================

// Core
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DictionaryKeyPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddHttpContextAccessor();
builder.Services.AddMemoryCache();

// Database - SQLite
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Data Source=clinic_dev.db";

builder.Services.AddDbContext<ClinicDbContext>(options =>
{
    options.UseSqlite(connectionString);
});

// Identity
builder.Services.AddIdentity<UserModel, IdentityRole<int>>(options =>
{
    options.Password.RequiredLength = 6;
    options.Password.RequireDigit = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<ClinicDbContext>();

// HttpClient for services that need it
builder.Services.AddHttpClient();

// Repositories
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

// Validators
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddFluentValidationClientsideAdapters();
builder.Services.AddValidatorsFromAssemblyContaining<RegisterDtoValidator>();
builder.Services.AddScoped<IValidator<CLINICSYSTEM.Data.DTOs.RegisterRequest>, RegisterRequestValidator>();
builder.Services.AddScoped<IValidator<CLINICSYSTEM.Data.DTOs.LoginRequest>, LoginRequestValidator>();

// Application services
builder.Services.AddScoped<IAuthenticationService, AuthenticationService>();
builder.Services.AddScoped<IDoctorService, DoctorService>();
builder.Services.AddScoped<IAppointmentService, AppointmentService>();
builder.Services.AddScoped<IConsultationService, ConsultationService>();
builder.Services.AddScoped<IPrescriptionService, PrescriptionService>();
builder.Services.AddScoped<IMedicalImageService, MedicalImageService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IReferralService, ReferralService>();
builder.Services.AddScoped<IBillingService, CLINICSYSTEM.Services.BillingService>();
builder.Services.AddScoped<PdfService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<ISmsService, SmsService>();
builder.Services.AddScoped<IFileStorageService, FileStorageService>();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<IPatientPortalService, PatientPortalService>();
builder.Services.AddScoped<IFhirService, FhirService>();
builder.Services.AddSingleton<IDateTimeProvider, DateTimeProvider>();
builder.Services
    .AddOptions<ReferralWebSocketOptions>()
    .Bind(builder.Configuration.GetSection(ReferralWebSocketOptions.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();
builder.Services.AddSingleton<ReferralWebSocketClientService>();
builder.Services.AddSingleton<IReferralWebSocketClient>(sp => sp.GetRequiredService<ReferralWebSocketClientService>());
// builder.Services.AddHostedService(sp => sp.GetRequiredService<ReferralWebSocketClientService>());

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("DoctorOnly", policy => policy.RequireRole("Doctor"));
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("StaffOnly", policy => policy.RequireRole("Staff", "Admin", "Doctor"));
    options.AddPolicy("PatientOnly", policy =>
        policy.RequireRole("Patient"));
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// AutoMapper
builder.Services.AddAutoMapper(typeof(Program).Assembly);

// Swagger
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Clinic API",
        Version = "v1"
    });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Enter JWT token with Bearer prefix",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

// ============================================
// BUILD APP
// ============================================
var app = builder.Build();

// ============================================
// MIDDLEWARE PIPELINE
// ============================================

// Global exception handler
app.UseMiddleware<GlobalExceptionHandler>();

// Swagger in development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// ============================================
// OPTIONAL: Auto-migrate database
// ============================================
// Run with: dotnet run -- --init-db
// Or set "Database:AutoInitialize": true in appsettings.json
var initializeDb = builder.Configuration.GetValue<bool>("Database:AutoInitialize", false);
if (Environment.GetCommandLineArgs().Contains("--init-db"))
    initializeDb = true;

if (initializeDb)
{
    using var scope = app.Services.CreateScope();
    try
    {
        var context = scope.ServiceProvider.GetRequiredService<ClinicDbContext>();
        var pending = await context.Database.GetPendingMigrationsAsync();
        if (pending.Any())
        {
            Console.WriteLine("Applying database migrations...");
            await context.Database.MigrateAsync();
            Console.WriteLine("Database migrations applied.");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"DB init failed: {ex.Message}");
    }
}

// ============================================
// START SERVER
// ============================================
try
{
    Console.WriteLine("Clinic API starting...");
    DataSeeder.SeedAsync(app).Wait();
    app.Urls.Add("http://0.0.0.0:5000");
    await app.RunAsync();
}
catch (Exception ex)
{
    Console.WriteLine($"FATAL ERROR: {ex.Message}");
    Console.WriteLine($"Details: {ex.StackTrace}");
    throw;
}
