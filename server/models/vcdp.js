const pool = require("../config/db");

const VCDP = {
  getAll: async () => {
    const query = 'SELECT * FROM "vcdp" WHERE is_active = true';
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

      const columnNames = [
        "Release_ID",
        "Pool",
        "Status",
        "Campus_Or_Rebadged",
        "Associate_ID",
        "Associate_Name",
        "Grade",
        "Skill",
        "Skill_Family",
        "Current_City",
        "Releasing_Practice",
        "Action",
        "Proposed_BU",
        "Comments",
        "Previous_Comments",
        "Visibility",
        "Release_Date",
        "Reason_For_Release",
        "Releasing_Project_Name",
        "REV_BU",
        "Releasing_Project_Id",
        "Releasing_Account",
        "Job_Code",
        "Designation",
        "Current_State",
        "Is_Masked",
        "Original_Release_Date",
        "Reason_For_Change",
        "Available_Date",
        "Service_Line",
        "Service_Line_Grouping",
        "Releasing_Department",
        "Project_Vertical",
        "Release_Approval_Required",
        "Reason_For_Approval",
        "Approved_By",
        "Willing_To_Relocate",
        "Willing_To_Travel",
        "Location_Preference",
        "Total_Experience",
        "Last_Project_Experience",
        "Technical_Skills",
        "Domain_Skills",
        "Days_In_PDP",
        "Adjusted_PDP_Ageing",
        "Days_In_CDP",
        "Actual_Bench_Ageing",
        "Tentative_Transfer_Date",
        "90th_day_Policy_Ageing",
        "No_Of_Matches",
        "No_Of_40_70_Matches",
        "No_Of_70_100_Matches",
        "No_of_Proposals",
        "No_Of_Active_Proposals",
        "No_Of_Inactive_Proposals",
        "No_of_Soft_Blocks",
        "Travel_Ready",
        "Visa_Country",
        "Visa_Type",
        "Notes",
        "Other_Preferences",
        "Country",
        "Resume_Uploaded",
        "Interview_Reject_Count",
        "Screening_Reject_Count",
        "Not_Screened_Reject_Count",
        "HM_Feedback_Count",
        "TSC_Feedback_Count",
        "Original_releasing_dept",
        "Original_releasing_practice",
        "TSC_Comments",
        "Comments_Updated_By_ID",
        "Preferred_Country",
        "Resignation_Status",
        "Updated_date",
        "Exclusive_Practices",
        "Policy",
        "Policy_Updated_By",
        "Policy_Start_date",
        "VCDP_Ageing",
        "Requested_Pool_Name",
        "Release_Initiated_Date",
        "Release_Approved_Date",
        "Long_Term_Relocation",
        "Short_Term_Assignment",
        "Travel_in_and_Out",
        "Remote_Working",
        "MDU_Vertical_Visibility",
        "Exlcusive_Verticals",
        "SO_Priority",
        "MU_Priority",
        "Reserve_Days",
        "Continuous_Policy_Applied_Ageing",
        "TimeLineStartDate",
        "SkillRecencyDate",
        "Market_Unit",
        "Market",
        "Number_Of_Releases_In_Last_180_Days",
        "Policy_Applied_Ageing_In_Last_180_Days",
        "Timeline_Transfer_Comment",
        "BU_Approver_comment",
        "Localization_Status",
        "Current_Practice",
        "Service_line",
        "Service_line_Grouping",
        "Current_Department",
        "Ageing_Paused_Days",
        "Is_PDP_Exclusive",
        "PDP_Exclusive_Practices",
      ];

      const allValues = dataArray.map((data, rowIndex) => {
        const normalizedData = Object.keys(data).reduce((acc, key) => {
          const normalizedKey = key
            .trim()
            .replace(/\./g, "")
            .replace(/-/, "")
            .replace(/ /g, "_");
          acc[normalizedKey] = data[key];
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
        INSERT INTO "vcdp" (${columnNames.map((col) => `"${col}"`).join(", ")})
        VALUES ${placeholders.join(", ")}
        RETURNING *
      `;

      console.log("Number of rows to insert:", dataArray.length);
      //console.log("Query:", query);
      console.log("Values length:", flatValues.length);

      const { rows } = await pool.query(query, flatValues);
      return Array.isArray(vcdpDataArray) ? rows : rows[0];
    } catch (error) {
      console.error("Error creating VCDP record(s):", error);
      throw error;
    }
  },
};

module.exports = VCDP;
