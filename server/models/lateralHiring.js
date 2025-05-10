// c:\Users\Parashuram\Projects\ei-demand-supply-tool\server\models\lateralHiring.js
const pool = require("../config/db");

const LateralHiring = {
  getAll: async () => {
    try {
      const query = 'SELECT * FROM lateral_hiring_stage';
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      console.error("Error in getAll:", error);
      throw error;
    }
  },

  create: async (lateralHiringDataArray) => {
    try {
      const dataArray = Array.isArray(lateralHiringDataArray)
        ? lateralHiringDataArray
        : [lateralHiringDataArray];

      if (!dataArray || dataArray.length === 0) {
        throw new Error("No data provided for insertion.");
      }

      const columnNames = [
        "requisition_no",
        "candidate_id",
        "candidate_full_name",
        "application_current_csw_status",
        "level",
        "owning_department",
        "offer_location",
        "acct_name",
        "primary_recruiter_name",
        "so_marked_for_recruitment_date",
        "offer_release_date",
        "joining_date",
        "joining_month",
        "joining_year",
        "primary_skills",
        "skill_group",
        "niche_skill_name",
        "niche_skill",
        "level_group",
        "offer_release_year",
        "offer_week",
        "offer_release_month",
        "original_offer_month",
      ];

      const allValues = dataArray.map((data, rowIndex) => {
        const normalizedData = Object.keys(data).reduce((acc, key) => {
          const normalizedKey = key.trim().replace(/ /g, "_").toLowerCase();
          acc[normalizedKey] = data[key];
          return acc;
        }, {});

        return columnNames.map((col, colIndex) => {
          const value = normalizedData[col.toLowerCase()];

          if (value === undefined || value === "" || value === null) {
            return null;
          }

          // Handle dates - Improved logic
          const dateColumns = [
            "so_marked_for_recruitment_date",
            "offer_release_date",
            "joining_date",
          ];
          if (dateColumns.includes(col.toLowerCase())) {
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

          // Handle integers
          if (["joining_year", "offer_release_year"].includes(col)) {
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
        INSERT INTO "lateral_hiring_stage" (${columnNames
          .map((col) => `"${col}"`)
          .join(", ")})
        VALUES ${placeholders.join(", ")}
        RETURNING *
      `;

      const { rows } = await pool.query(query, flatValues);
      return Array.isArray(lateralHiringDataArray) ? rows : rows[0];
    } catch (error) {
      console.error("Error creating Lateral Hiring record(s):", error);
      console.error("Error details:", error);
      throw error;
    }
  },
};

module.exports = LateralHiring;
