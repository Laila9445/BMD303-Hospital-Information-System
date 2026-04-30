using AutoMapper;
using Billing_Backend.Data.DTOs;
using Billing_Backend.Models;

namespace Billing_Backend.Mappings
{
    public class BillingMappingProfile : Profile
    {
        public BillingMappingProfile()
        {
            // Invoice mappings
            CreateMap<InvoiceModel, InvoiceDto>().ReverseMap();
            CreateMap<InvoiceDto, InvoiceModel>();

            // InvoiceItem mappings
            CreateMap<InvoiceItemModel, InvoiceItemDto>().ReverseMap();
            CreateMap<InvoiceItemDto, InvoiceItemModel>();
            CreateMap<CreateInvoiceItemDto, InvoiceItemModel>();

            // Payment mappings
            CreateMap<PaymentModel, PaymentDto>().ReverseMap();
            CreateMap<PaymentDto, PaymentModel>();
            CreateMap<CreatePaymentDto, PaymentModel>();
        }
    }
}
