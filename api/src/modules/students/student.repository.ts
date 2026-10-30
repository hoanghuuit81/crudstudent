import type { Knex } from "knex";
import { getOffset } from "../../common/pagination.js";
import { db } from "../../database/connection.js";
import type { StudentInput, StudentQuery, StudentRecord, StudentView } from "./student.types.js";

function studentListQuery(connection: Knex = db) {
  return connection("students as s")
    .join("classes as c", "c.id", "s.class_id")
    .select(
      "s.id",
      "s.student_code",
      "s.full_name",
      "s.email",
      "s.birth_date",
      "s.class_id",
      "s.created_at",
      "s.updated_at",
      "c.code as classCode",
      "c.name as className"
    );
}

function applyFilters<T extends Knex.QueryBuilder>(builder: T, query: StudentQuery): T {
  if (query.q) {
    builder.where((nested) => {
      const keyword = `%${query.q}%`;
      nested
        .whereRaw("?? LIKE ?", ["s.student_code", keyword])
        .orWhereRaw("?? LIKE ?", ["s.full_name", keyword])
        .orWhereRaw("?? LIKE ?", ["s.email", keyword]);
    });
  }
  if (query.classId) builder.where("s.class_id", query.classId);
  return builder;
}

export const studentRepository = {
  async findAll(query: StudentQuery): Promise<{ items: StudentView[]; total: number }> {
    const listQuery = applyFilters(studentListQuery(), query)
      .orderBy("s.id", "desc")
      .limit(query.limit)
      .offset(getOffset(query));
    const countQuery = applyFilters(db("students as s"), query)
      .count<{ total: string }[]>("s.id as total")
      .first();
    const [items, count] = await Promise.all([listQuery, countQuery]);
    return { items: items as StudentView[], total: Number(count?.total ?? 0) };
  },

  async findById(id: number): Promise<StudentView | undefined> {
    return studentListQuery().where("s.id", id).first() as Promise<StudentView | undefined>;
  },

  async create(input: StudentInput): Promise<number> {
    const [id] = await db<StudentRecord>("students").insert(input);
    if (id === undefined) throw new Error("Không nhận được ID sinh viên vừa tạo");
    return id;
  },

  async update(id: number, input: Partial<StudentInput>): Promise<number> {
    return db<StudentRecord>("students")
      .where({ id })
      .update({ ...input, updated_at: db.fn.now() });
  },

  async remove(id: number): Promise<number> {
    return db<StudentRecord>("students").where({ id }).del();
  }
};
