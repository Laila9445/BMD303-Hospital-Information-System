using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CLINICSYSTEM.Models
{
    public class RadiologyReport
    {
        [Key]
        public int Id { get; set; }

        public int StudyId { get; set; }
        [ForeignKey(nameof(StudyId))]
        public RadiologyStudy? Study { get; set; }

        public int RadiologistId { get; set; }
        [ForeignKey(nameof(RadiologistId))]
        public UserModel? Radiologist { get; set; }

        public int PatientId { get; set; }
        [ForeignKey(nameof(PatientId))]
        public UserModel? Patient { get; set; }

        [StringLength(4000)]
        public string? Findings { get; set; }

        [StringLength(2000)]
        public string? Impression { get; set; }

        [StringLength(2000)]
        public string? Recommendations { get; set; }

        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "Draft";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
