import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("students", (table) => {
    table.increments("id").primary();
    table.string("student_code", 20).notNullable().unique();
    table.string("full_name", 150).notNullable();
    table.string("email", 190).notNullable().unique();
    table.date("birth_date").notNullable();
    table.integer("class_id").unsigned().notNullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());

    table.index("class_id", "students_class_id_index");
    table
      .foreign("class_id", "students_class_id_foreign")
      .references("id")
      .inTable("classes")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("students");
}
