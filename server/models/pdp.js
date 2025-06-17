const pool = require("../config/db");

const PDP = {
  getAll: async () => {
    const query = 'SELECT * FROM "ds_pdp_main"';
    const { rows } = await pool.query(query);
    return rows;
  },
  create: async (pdpData) => {
    const query = `
  INSERT INTO "pdp_stage" (
    "pdptranid", "employeeid", "employeename", "grade", "primaryskill",
    "secondaryskill", "hackersrankscore", "location", "projectid", "projectname",
    "allocationstartdate", "allocationenddate", "vertical", "practice",
    "departmentname", "releasingprojectid", "releasingprojectname",
    "releasingaccountname", "releasingmarketunit", "releasingbusinessunit",
    "releasingprojectpmid", "releasingprojectpmname", "region", "action",
    "proposedbu", "actiondate",
    "displayed_project_allocation_", "deployable_", "billability_", "comments",
    "previouscomments", "pdpageing", "visibility", "hr_status", "campus",
    "adp_ageing", "benchageing", "ageingbucket", "dateofjoining",
    "prioritybilling", "pdppolicy", "pdppolicyinitiationdate", "onvcdp",
    "dateofpostingtovcdp", "projectedreleasedate", "proposal1documentation",
    "proposal2documentation", "proposal3documentation",
    "associateonapprovedbenefitsleave",
    "wasassociateonbenchbeforegoingonbenefitsleave", "cooapproval",
    "cooapprovaltilldate",  "proposedaccountname", "pocname"
  ) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
    $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
    $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44,
    $45, $46, $47, $48, $49, $50, $51, $52, $53, $54
  ) RETURNING *
`;
   // Function to format dates to 'YYYY-MM-DD'
  const formatDate = (date) => {
    if (!date) return null;
    try {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Error formatting date:", date, error);
      return null; // Handle invalid dates gracefully
    }
  };

    const values = [
      pdpData.PDPTranId || null,
      pdpData.EmployeeId || null,
      pdpData.EmployeeName || null,
      pdpData.Grade || null,
      pdpData.PrimarySkill || null,
      pdpData.SecondarySkill || null,
      pdpData.HackersRankScore || null,
      pdpData.Location || null,
      pdpData.ProjectId || null,
      pdpData.ProjectName || null,
      formatDate(pdpData.AllocationStartDate) || null,
      formatDate(pdpData.AllocationEndDate) || null,
      pdpData.Vertical || null,
      pdpData.Practice || null,
      pdpData.DepartmentName || null,
      pdpData.ReleasingProjectId || null,
      pdpData.ReleasingProjectName || null,
      pdpData.ReleasingAccountName || null,
      pdpData.ReleasingMarketUnit || null,
      pdpData.ReleasingBusinessUnit || null,
      pdpData.ReleasingProjectPMID || null,
      pdpData.ReleasingProjectPMName || null,
      pdpData.Region || null,
      pdpData.Action || null,
      pdpData.ProposedBU || null,
      formatDate(pdpData.ActionDate) || null,
      pdpData["Displayed Project - Allocation%"] || null,
      pdpData["Deployable %"] || null,
      pdpData["Billability %"] || null,
      pdpData.Comments || null,
      pdpData.PreviousComments || null,
      pdpData.PDPAgeing || null,
      pdpData.Visibility || null,
      pdpData["HR Status"] || null,
      pdpData.Campus || null,
      pdpData["ADP Ageing"] || null,
      pdpData.BenchAgeing || null,
      pdpData.AgeingBucket || null,
      formatDate(pdpData.DateOfJoining) || null,
      pdpData.PriorityBilling || null,
      pdpData.PDPPolicy || null,
      formatDate(pdpData.PDPPolicyInitiationDate) || null,
      pdpData.OnVCDP || null,
      formatDate(pdpData.DateOfPostingToVCDP) || null,
      formatDate(pdpData.ProjectedReleaseDate) || null,
      pdpData.Proposal1Documentation || null,
      pdpData.Proposal2Documentation || null,
      pdpData.Proposal3Documentation || null,
      pdpData.AssociateonapprovedBenefitsLeave || null,
      pdpData.WasAssociateonBenchbeforegoingonBenefitsLeave || null,
      pdpData.COOApproval || null,
      formatDate(pdpData.COOApprovalTillDate) || null,
      pdpData.ProposedAccountName || null,
      pdpData.PoCName || null,
    ];

    //console.log("Query:", query);
   // console.log("Values:", values);

    try {
      const { rows } = await pool.query(query, values);
      return rows[0];
    } catch (error) {
      console.error("Error creating PDP:", error);
      throw error;
    }
  },
};

module.exports = PDP;
