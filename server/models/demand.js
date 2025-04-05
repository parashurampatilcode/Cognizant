const pool = require("../config/db");

const Demand = {
  getAll: async () => {
    try {
      const query = 'SELECT * FROM "so_data_1"';
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      console.error("Error in getAll:", error);
      throw error;
    }
  },

  create: async (demandDataArray) => {
    try {
      const dataArray = Array.isArray(demandDataArray)
        ? demandDataArray
        : [demandDataArray];

      if (!dataArray || dataArray.length === 0) {
        throw new Error("No data provided for insertion.");
      }

      const columnNames = [
        "so_line_status",
        "unique_id",
        "overall_true_demands",
        "market",
        "market_unit",
        "department",
        "vertical",
        "off_on",
        "geography",
        "so_grade",
        "tmratecard",
        "job_code",
        "flagged_for_recruitment",
        "when_flagged_for_recruitment",
        "account_name",
        "parent_customer",
        "project_id",
        "project_name",
        "hiring_manager",
        "so_submission_date",
        "city",
        "skill_tower",
        "modified_skill_group",
        "skill_family",
        "technical_skills_required",
        "technical_skills_desired",
        "current_status",
        "fet_demand_status",
        "fet_remarks",
        "candidate_name",
        "date_of_joining",
        "grade",
        "tmp_remarks",
        "requirement_start_date",
        "requirment_month",
        "pe_flagged",
        "pdl_id",
        "pdl_name",
        "demand_type",
        "demand_status",
        "fulfilment_plan",
        "demand_category",
        "supply_source",
        "rotation_so",
        "supply_account",
        "identified_assoc_idexternal_candidate_id",
        "identified_assoc_name",
        "grade_1",
        "eff_month",
        "joining_allocation_date",
        "allocation_week",
        "included_in_forecast_yn",
        "cross_skill_required_yesno",
        "remarksdetails",
        "cluster_description",
        "owning_organization",
        "pool_id",
        "pool_name",
        "practice",
        "subvertical",
        "subpractice",
        "bu",
        "businessunit_desc",
        "sbu1",
        "sbu2",
        "account_id",
        "parent_customer_id",
        "project_type",
        "project_billability_type",
        "associate_previous_project",
        "associate_previous_account",
        "associate_previous_department",
        "associate_fulfilled_against_the_so",
        "associate_hired_grade",
        "quantity",
        "action_date",
        "offer_created_date",
        "offer_extended_date",
        "available_positions_in_rr",
        "offer_status",
        "offer_sub_status",
        "no_of_offers",
        "job_opening_status",
        "recruiter_id",
        "recruiter_name",
        "subcontractor_allowed_by_customer",
        "interview_required_by_customer",
        "assignment_start_date",
        "cancelled_by_id",
        "cancellation_reason",
        "cancellation_comments",
        "country",
        "preferred_location_1",
        "preferred_location_2",
        "fulfilmentcancellation_month",
        "week_name",
        "requirement_end_date",
        "so_billability",
        "additional_revenue",
        "billability_start_date",
        "internal_fulfilment_tat",
        "external_fulfilment_wfm_tat",
        "external_fulfilment_tag_tat",
        "tat_flag_dt_to_interview_dt",
        "tat_int_to_offer_creation",
        "tat_offer_create_to_offer_approve",
        "tat_offer_apprvd_to_offer_extnd",
        "tat_offer_extnd_edoj",
        "tat_exp_doj_doj",
        "source_category",
        "percentile_range_sal",
        "cancellation_ageing",
        "open_so_ageing",
        "rr_ageing",
        "open_so_ageing_range",
        "rr_ageing_range",
        "so_type",
        "cca_service_line",
        "cca_service_line_description",
        "track",
        "track_description",
        "sub_track",
        "sub_track_description",
        "demand_role_code",
        "demand_role_description",
        "functional_skills",
        "leadership_and_prof_dev_comp",
        "additional_skills",
        "rlc",
        "rsc1",
        "rsc2",
        "rsc3",
        "domain_skill_layer_1",
        "domain_skill_layer_2",
        "domain_skill_layer_3",
        "domain_skill_layer4",
        "requirement_type",
        "revenue_potential",
        "revenue_loss_category",
        "staffing_team_member",
        "staffing_team_lead",
        "sostatus",
        "tmp_so_status",
        "probable_fullfilment_date",
        "entered_by",
        "open_trained_associate",
        "primary_skill_set",
        "opportunity_id",
        "expected_date_of_joining",
        "fulfillment_month",
        "replaced_associate",
        "customer_bill_rate",
        "bill_rate_currency",
        "customer_profitability",
        "oe_approval_flag",
        "oe_approver_id",
        "oe_approver_date",
        "oe_approval_comments",
        "tsc_approval_flag",
        "tsc_approver_id",
        "tsc_approver_date",
        "tsc_approval_comments",
        "customer_project",
        "primary_state_tag",
        "secondary_state_tag",
        "status_remark",
        "opportunity_status",
        "job_description",
        "revenue",
        "greenchannel",
        "forecast_category",
        "win_probability",
        "estimated_deal_close_date",
        "actual_expected_revenue_start_date",
        "opportunity_owner",
        "ownerid",
        "recommended_for_hiring_by",
        "recommended_for_hiring_on",
        "so_priority",
        "mu_priority",
        "assignment_staging_date",
        "confirmed_anticipatory_formula",
        "project_staff_aug_formula",
        "so_status",
        "true_demand_na",
        "true_demand_ggm",
        "actionable_true_demand",
        "priority_demand",
        "short_fuse_demand",
        "short_fuse_duration",
        "ageing",
        "rev_bu",
        "rev_geo",
        "rev_grade",
        "short_fuse_demands",
        "ageing_1",
        "grouping",
        "top_accounts",
        "interview_status",
        "demand_type_1",
        "created_date",
        "created_by",
        "modified_date",
        "modified_by",
        "is_active", // Added is_active
      ];

      const allValues = dataArray.map((data, rowIndex) => {
        const normalizedData = Object.keys(data).reduce((acc, key) => {
          const normalizedKey = key
            .trim() // Remove leading/trailing spaces
            .replace(/\s+/g, " ") // Replace multiple spaces with single space
            .replace(/[^a-zA-Z0-9\s]/g, "_") // Replace special chars with underscore
            .replace(/\s/g, "_") // Replace remaining spaces with underscore
            .replace(/_+/g, "_") // Replace multiple underscores with single underscore
            .toLowerCase(); // Convert to lowercase
          acc[normalizedKey] = data[key];
          return acc;
        }, {});

        return columnNames.map((col, colIndex) => {
          // Use lowercase for column name lookup
          const value = normalizedData[col.toLowerCase()];

          if (value === undefined || value === "" || value === null) {
            return null;
          }

          // Handle dates
          if (
            col.toLowerCase().includes("date") ||
            //col.toLowerCase().includes("_on") ||
            col === "oe_approver_date" ||
            col === "tsc_approver_date"
          ) {
            if (!value) return null;
            const date = new Date(value);
            if (isNaN(date.getTime())) {
              console.log(
                `Invalid date value at row ${rowIndex}, column ${col}: ${value}`
              );
              return null;
            }
            return date.toISOString();
          }

          // Handle booleans
          if (
            col === "included_in_forecast_yn" ||
            col === "cross_skill_required_yesno" ||
            col === "oe_approval_flag" ||
            col === "tsc_approval_flag"
          ) {
            return (
              value?.toString().toLowerCase() === "true" ||
              value?.toString().toLowerCase() === "yes" ||
              value === true
            );
          }

          // Handle numeric fields
          if (
            [
              "account_id",
              "parent_customer_id",
              "quantity",
              "available_positions_in_rr",
              "no_of_offers",
              "additional_revenue",
              "percentile_range_sal",
              "revenue_potential",
              "customer_bill_rate",
              "revenue",
              "win_probability",
            ].includes(col)
          ) {
            return value ? parseFloat(value) : null;
          }
          if (col === "is_active") {
            return true; // Set is_active to true
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
        INSERT INTO "so_data_1" (${columnNames
          .map((col) => `"${col}"`)
          .join(", ")})
        VALUES ${placeholders.join(", ")}
        RETURNING *
      `;

      const { rows } = await pool.query(query, flatValues);
      return Array.isArray(demandDataArray) ? rows : rows[0];
    } catch (error) {
      console.error("Error creating Demand record(s):", error);
      console.error("Error details:", error); // Added this line
      throw error;
    }
  },
};

module.exports = Demand;
