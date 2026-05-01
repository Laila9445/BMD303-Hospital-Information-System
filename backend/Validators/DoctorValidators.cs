//using CLINICSYSTEM.Constants;
//using CLINICSYSTEM.Data.DTOs;
//using FluentValidation;
//using System.Linq;

//namespace CLINICSYSTEM.Validators;

///// <summary>
///// Validator for creating doctor schedules
///// </summary>
//public class CreateScheduleRequestValidator : AbstractValidator<CreateScheduleRequest>
//{
//    public CreateScheduleRequestValidator()
//    {
//        RuleFor(x => x.DayOfWeek)
//            .NotEmpty().WithMessage(ValidationMessages.DayOfWeekRequired)
//            .Must(day => new[] { "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday" }.Contains(day))
//            .WithMessage(ValidationMessages.DayOfWeekInvalid);

//        RuleFor(x => x.StartTime)
//            .NotEmpty().WithMessage(ValidationMessages.StartTimeRequired);

//        RuleFor(x => x.EndTime)
//            .NotEmpty().WithMessage(ValidationMessages.EndTimeRequired)
//            .Must((request, endTime) => request.EndTimeSpan > request.StartTimeSpan)
//            .WithMessage(ValidationMessages.EndTimeBeforeStartTime);

//        RuleFor(x => x.SlotDurationMinutes)
//            .GreaterThan(0)
//            .LessThanOrEqualTo(120)
//            .WithMessage("Slot duration must be between 1 and 120 minutes.");
//    }
//}
