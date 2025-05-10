const pool = require("../config/db");

const VCDP = {
  getAll: async () => {
    const query = 'SELECT * FROM "ds_vcdp_main"';
    const { rows } = await pool.query(query);
    return rows;
  },

  create: async (vcdpDataArray) => {
    try {
      const dataArray = Array.isArray(vcdpDataArray)
        ? vcdpDataArray
        : [vcdpDataArray];

      if (!dataArray || dataArray.length === 0) {
        throw new Error("No data provided for insertion.");
      }
      //console.log("Data to be inserted models vcdp:", dataArray);
      const columnNames = [
        "release_id",
        "pool",
        "status",
        "campus_or_rebadged",
        "associate_id",
        "associate_name",
        "grade",
        "skill",
        "skill_family",
        "current_city",
        "releasing_practice",
        "action",
        "proposed_bu",
        "comments",
        "previous_comments",
        "visibility",
        "release_date",
        "reason_for_release",
        "releasing_project_name",
        "rev_bu",
        "releasing_project_id",
        "releasing_account",
        "job_code",
        "designation",
        "current_state",
        "is_masked",
        "original_release_date",
        "reason_for_change",
        "available_date",
        "service_line",
        "service_line_grouping",
        "releasing_department",
        "project_vertical",
        "release_approval_required",
        "reason_for_approval",
        "approved_by",
        "willing_to_relocate",
        "willing_to_travel",
        "location_preference",
        "total_experience",
        "last_project_experience",
        "technical_skills",
        "domain_skills",
        "days_in_pdp",
        "adjusted_pdp_ageing",
        "days_in_cdp",
        "actual_bench_ageing",
        "tentative_transfer_date",
        "90th_day_policy_ageing",
        "no_of_matches",
        "no_of_40_70_matches",
        "no_of_70_100_matches",
        "no_of_proposals",
        "no_of_active_proposals",
        "no_of_inactive_proposals",
        "no_of_soft_blocks",
        "travel_ready",
        "visa_country",
        "visa_type",
        "notes",
        "other_preferences",
        "country",
        "resume_uploaded",
        "interview_reject_count",
        "screening_reject_count",
        "not_screened_reject_count",
        "hm_feedback_count",
        "tsc_feedback_count",
        "original_releasing_dept",
        "original_releasing_practice",
        "tsc_comments",
        "comments_updated_by_id",
        "preferred_country",
        "resignation_status",
        "updated_date",
        "exclusive_practices",
        "policy",
        "policy_updated_by",
        "policy_start_date",
        "vcdp_ageing",
        "requested_pool_name",
        "release_initiated_date",
        "release_approved_date",
        "long_term_relocation",
        "short_term_assignment",
        "travel_in_and_out",
        "remote_working",
        "mdu_vertical_visibility",
        "exlcusive_verticals",
        "so_priority",
        "mu_priority",
        "reserve_days",
        "continuous_policy_applied_ageing",
        "timeline_start_date",
        "skillrecencydate",
        "market_unit",
        "market",
        "number_of_releases_in_last_180_days",
        "policy_applied_ageing_in_last_180_days",
        "timeline_transfer_comment",
        "bu_approver_comment",
        "localization_status",
        "current_practice",
        //"Service_line",
       // "Service_line_Grouping",
        "current_department",
        "ageing_paused_days",
        "is_pdp_exclusive",
        "pdp_exclusive_practices",
      ];

      const allValues = dataArray.map((data, rowIndex) => {
        const normalizedData = Object.keys(data).reduce((acc, key) => {
          //console.log("Key:", key); // Debug
          const normalizedKey = key
            .trim()
            .replace(/\./g, "")
            .replace(/-/, "")
            .replace(/ /g, "_")
            .toLowerCase();
          acc[normalizedKey] = data[key];
          //console.log("normalizedKey:", normalizedKey); // Debug
          return acc;
        }, {});

        return columnNames.map((col, colIndex) => {
          const value = normalizedData[col];

          if (value === undefined || value === "" || value === null) {
            return null;
          }

          // Handle dates with validation
          if (col.toLowerCase().includes("date")) {
            if (!value) return null;
            const date = new Date(value);
            if (isNaN(date.getTime())) {
              console.log(
                `Invalid date value at row ${rowIndex}, column ${col}: ${value}`
              );
              return null; // Return null for invalid dates instead of throwing error
            }
            return date.toISOString();
          }

          // Handle integers
          if (
            [
              "Release_ID",
              "Associate_ID",
              "Releasing_Project_Id",
              "Total_Experience",
              "Last_Project_Experience",
              "Days_In_PDP",
              "Adjusted_PDP_Ageing",
              "Days_In_CDP",
              "Actual_Bench_Ageing",
              "No_Of_Matches",
              "No_Of_40_70_Matches",
              "No_Of_70_100_Matches",
              "No_of_Proposals",
              "No_Of_Active_Proposals",
              "No_Of_Inactive_Proposals",
              "No_of_Soft_Blocks",
              "Interview_Reject_Count",
              "Screening_Reject_Count",
              "Not_Screened_Reject_Count",
              "HM_Feedback_Count",
              "TSC_Feedback_Count",
              "VCDP_Ageing",
              "Reserve_Days",
              "Continuous_Policy_Applied_Ageing",
              "Number_Of_Releases_In_Last_180_Days",
              "Policy_Applied_Ageing_In_Last_180_Days",
              "Ageing_Paused_Days",
            ].includes(col)
          ) {
            return value ? parseInt(value, 10) : null;
          }

          return value;
        });
      });

      const flatValues = allValues.flat();
      const placeholders = allValues.map((_, rowIndex) => {
        const startIndex = rowIndex * columnNames.length + 1;
        const rowPlaceholders = columnNames.map(
          (_, colIndex) => `$${startIndex + colIndex}`
        );
        return `(${rowPlaceholders.join(", ")})`;
      });

      const query = `
        INSERT INTO "vcdp_stage" (${columnNames.map((col) => `"${col}"`).join(", ")})
        VALUES ${placeholders.join(", ")}
        RETURNING *
      `;
      //console.log("Query:", query);
      console.log("flatValues:", flatValues);
      const { rows } = await pool.query(query, flatValues);
      return Array.isArray(vcdpDataArray) ? rows : rows[0];
    } catch (error) {
      console.error("Error creating VCDP record(s):", error);
      throw error;
    }
  },
};

module.exports = VCDP;
