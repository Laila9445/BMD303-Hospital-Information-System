# Production Deployment Guide

## Pre-Deployment Checklist

### Security
- [ ] Change JWT secret key to a strong random value (min 64 characters)
- [ ] Update connection string with production database credentials
- [ ] Enable HTTPS only
- [ ] Configure CORS for specific origins only
- [ ] Review and adjust rate limiting settings
- [ ] Enable API key authentication if needed
- [ ] Set up SSL certificates

### Configuration
- [ ] Set `ASPNETCORE_ENVIRONMENT=Production`
- [ ] Configure appsettings.Production.json
- [ ] Set up environment variables for secrets
- [ ] Configure logging levels
- [ ] Set up log aggregation (e.g., Application Insights)

### Database
- [ ] Create production database
- [ ] Run migrations on production
- [ ] Set up database backups
- [ ] Configure connection pooling
- [ ] Review and optimize indexes

### Performance
- [ ] Configure caching strategy
- [ ] Set up CDN for static files
- [ ] Enable response compression
- [ ] Configure connection limits
- [ ] Load testing completed

## Deployment Steps

### 1. Configure Production Settings

Create `appsettings.Production.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=prod-server;Database=ClinicSystemDb;User Id=app_user;Password=***;Encrypt=true;"
  },
  "JwtSettings": {
    "SecretKey": "USE-AZURE-KEY-VAULT-OR-ENV-VAR",
    "ExpirationMinutes": 480,
    "Issuer": "ClinicAPI",
    "Audience": "ClinicApp"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "yourdomain.com"
}
```

### 2. Build for Production
```powershell
cd backend
dotnet publish -c Release -o ./publish
```

### 3. Database Migration
```powershell
# On production server
dotnet ef database update --connection "your-connection-string"
```

### 4. Deploy to IIS

#### Install Prerequisites
- .NET 8.0 Hosting Bundle
- URL Rewrite Module

#### Configure IIS
1. Create new Application Pool
   - .NET CLR Version: No Managed Code
   - Managed Pipeline Mode: Integrated

2. Create new Website
   - Physical Path: Point to publish folder
   - Binding: HTTPS on port 443

3. Configure web.config (auto-generated):
```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="aspNetCore" path="*" verb="*" modules="AspNetCoreModuleV2" />
    </handlers>
    <aspNetCore processPath="dotnet" 
                arguments=".\CLINICSYSTEM.dll" 
                stdoutLogEnabled="false" 
                stdoutLogFile=".\logs\stdout" 
                hostingModel="inprocess" />
  </system.webServer>
</configuration>
```

### 5. Deploy to Azure App Service

#### Using Azure CLI
```powershell
az login
az webapp deployment source config-zip --resource-group MyResourceGroup --name MyClinicAPI --src publish.zip
```

#### Configure App Settings
```powershell
az webapp config appsettings set --resource-group MyResourceGroup --name MyClinicAPI --settings ASPNETCORE_ENVIRONMENT=Production
az webapp config connection-string set --resource-group MyResourceGroup --name MyClinicAPI --connection-string-type SQLAzure --settings DefaultConnection="your-connection-string"
```

### 6. Deploy to Docker

Create `Dockerfile`:
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["CLINICSYSTEM.csproj", "./"]
RUN dotnet restore "CLINICSYSTEM.csproj"
COPY . .
RUN dotnet build "CLINICSYSTEM.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "CLINICSYSTEM.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "CLINICSYSTEM.dll"]
```

Build and run:
```powershell
docker build -t clinic-api .
docker run -d -p 5000:80 -p 5001:443 --name clinic-api clinic-api
```

## Environment Variables

Set these in production:

```powershell
# Windows
$env:ASPNETCORE_ENVIRONMENT="Production"
$env:ConnectionStrings__DefaultConnection="your-connection-string"
$env:JwtSettings__SecretKey="your-secret-key"

# Linux
export ASPNETCORE_ENVIRONMENT=Production
export ConnectionStrings__DefaultConnection="your-connection-string"
export JwtSettings__SecretKey="your-secret-key"
```

## Post-Deployment

### 1. Health Checks
Test these endpoints:
- GET /api/auth/login
- POST /api/auth/register
- Swagger UI (disable in production if needed)

### 2. Monitoring Setup
- Configure Application Insights
- Set up alerts for errors
- Monitor performance metrics
- Track API usage

### 3. Logging
- Verify logs are being written
- Set up log rotation
- Configure log retention policy

### 4. Backup Strategy
- Daily database backups
- Transaction log backups every hour
- Test restore procedures
- Store backups offsite

### 5. Security Hardening
```powershell
# Disable detailed error messages
$env:ASPNETCORE_DETAILEDERRORS="false"

# Disable developer exception page
# Already handled by environment check in Program.cs
```

## SSL/TLS Configuration

### Using Let's Encrypt (Free)
```powershell
# Install Certbot
certbot certonly --webroot -w /var/www/html -d yourdomain.com

# Auto-renewal
certbot renew --dry-run
```

### Configure HTTPS Redirect
Already configured in Program.cs with `app.UseHttpsRedirection()`

## Performance Tuning

### 1. Database Connection Pooling
Add to connection string:
```
Min Pool Size=10;Max Pool Size=100;
```

### 2. Enable Response Compression
Add to Program.cs before `app.Build()`:
```csharp
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
});
```

### 3. Configure Caching Headers
For static files, add cache headers in middleware.

## Scaling Considerations

### Horizontal Scaling
- Use Azure SQL Database or SQL Server Always On
- Configure session state for distributed cache
- Use Azure Blob Storage for medical images
- Implement Redis cache for distributed caching

### Load Balancing
- Configure health check endpoints
- Use Azure Application Gateway or similar
- Enable sticky sessions if needed

## Troubleshooting

### Application Won't Start
1. Check logs in `logs/` directory
2. Verify .NET 8.0 runtime is installed
3. Check database connectivity
4. Verify file permissions

### Database Connection Issues
1. Test connection string separately
2. Check firewall rules
3. Verify SQL Server is running
4. Check authentication mode

### Performance Issues
1. Check database query performance
2. Review application logs
3. Monitor memory usage
4. Check for N+1 query problems

## Rollback Plan

### Quick Rollback
1. Stop the application
2. Restore previous version files
3. Revert database migrations if needed
4. Restart application

### Database Rollback
```powershell
dotnet ef database update PreviousMigrationName
```

## Compliance & Regulations

### Egyptian MOHP Requirements
- Ensure data encryption at rest and in transit
- Implement audit logging for all medical record access
- Patient data retention policy
- Secure backup procedures
- Access control and authentication

### GDPR Considerations (if applicable)
- Right to be forgotten implementation
- Data portability
- Consent management
- Privacy policy

## Maintenance Windows

Schedule regular maintenance:
- Database maintenance (index optimization)
- Log cleanup
- Security updates
- Dependency updates

## Contact & Support
- Development Team: [Your email]
- Emergency Contact: [Emergency number]
- Documentation: [Wiki/Documentation URL]
