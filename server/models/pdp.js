const pool = require("../config/db");

const PDP = {
  getAll: async () => {
    const query = 'SELECT * FROM "PDP"';
    const { rows } = await pool.query(query);
    return rows;
  },
  create: async (pdpData) => {
    const query = `
  INSERT INTO "PDP" (
    "PDPTranId", "EmployeeId", "EmployeeName", "Grade", "PrimarySkill",
    "SecondarySkill", "HackersRankScore", "Location", "ProjectId", "ProjectName",
    "AllocationStartDate", "AllocationEndDate", "Vertical", "Practice",
    "DepartmentName", "ReleasingProjectId", "ReleasingProjectName",
    "ReleasingAccountName", "ReleasingMarketUnit", "ReleasingBusinessUnit",
    "ReleasingProjectPMID", "ReleasingProjectPMName", "Region", "Action",
    "ProposedBU", "ActionDate",
    "Displayed Project - Allocation%", "Deployable %", "Billability %", "Comments",
    "PreviousComments", "PDPAgeing", "Visibility", "HR Status", "Campus",
    "ADP Ageing", "BenchAgeing", "AgeingBucket", "DateOfJoining",
    "PriorityBilling", "PDPPolicy", "PDPPolicyInitiationDate", "OnVCDP",
    "DateOfPostingToVCDP", "ProjectedReleaseDate", "Proposal1Documentation",
    "Proposal2Documentation", "Proposal3Documentation",
    "AssociateonapprovedBenefitsLeave",
    "WasAssociateonBenchbeforegoingonBenefitsLeave", "COOApproval",
    "COOApprovalTillDate", "createdDate", "ProposedAccountName", "PoCName"
  ) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
    $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
    $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44,
    $45, $46, $47, $48, $49, $50, $51, $52, NOW(), $53, $54
  ) RETURNING *
`;
    const values = [
      pdpData.PDPTranId,
      pdpData.EmployeeId,
      pdpData.EmployeeName,
      pdpData.Grade,
      pdpData.PrimarySkill,
      pdpData.SecondarySkill,
      pdpData.HackersRankScore,
      pdpData.Location,
      pdpData.ProjectId,
      pdpData.ProjectName,
      pdpData.AllocationStartDate,
      pdpData.AllocationEndDate,
      pdpData.Vertical,
      pdpData.Practice,
      pdpData.DepartmentName,
      pdpData.ReleasingProjectId,
      pdpData.ReleasingProjectName,
      pdpData.ReleasingAccountName,
      pdpData.ReleasingMarketUnit,
      pdpData.ReleasingBusinessUnit,
      pdpData.ReleasingProjectPMID,
      pdpData.ReleasingProjectPMName,
      pdpData.Region,
      pdpData.Action,
      pdpData.ProposedBU,
      pdpData.ActionDate,
      pdpData["Displayed Project - Allocation%"],
      pdpData["Deployable %"],
      pdpData["Billability %"],
      pdpData.Comments,
      pdpData.PreviousComments,
      pdpData.PDPAgeing,
      pdpData.Visibility,
      pdpData["HR Status"],
      pdpData.Campus,
      pdpData["ADP Ageing"],
      pdpData.BenchAgeing,
      pdpData.AgeingBucket,
      pdpData.DateOfJoining,
      pdpData.PriorityBilling,
      pdpData.PDPPolicy,
      pdpData.PDPPolicyInitiationDate,
      pdpData.OnVCDP,
      pdpData.DateOfPostingToVCDP,
      pdpData.ProjectedReleaseDate,
      pdpData.Proposal1Documentation,
      pdpData.Proposal2Documentation,
      pdpData.Proposal3Documentation,
      pdpData.AssociateonapprovedBenefitsLeave,
      pdpData.WasAssociateonBenchbeforegoingonBenefitsLeave,
      pdpData.COOApproval,
      pdpData.COOApprovalTillDate,
      pdpData.ProposedAccountName,
      pdpData.PoCName,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },
};

module.exports = PDP;
