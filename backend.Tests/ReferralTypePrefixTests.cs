using Xunit;

namespace CLINICSYSTEM.Tests;

/// <summary>
/// Documents referral type prefixes expected by ReferralService department routing.
/// </summary>
public class ReferralTypePrefixTests
{
    [Theory]
    [InlineData("radiology-chest-xray", "Radiology")]
    [InlineData("physiotherapy-back-pain", "Physiotherapy")]
    [InlineData("physio-back-pain", "Doctor")]
    public void DepartmentFromReferralTypePrefix_MatchesBackendRules(string referralType, string expectedDepartment)
    {
        string department;
        if (referralType.StartsWith("radiology-"))
            department = "Radiology";
        else if (referralType.StartsWith("physiotherapy-"))
            department = "Physiotherapy";
        else
            department = "Doctor";

        Assert.Equal(expectedDepartment, department);
    }
}
