exports.up = function(knex) {
  return knex.schema.createTable('items', function(table) {
    table.string('id', 31).notNullable().primary()

    table.double('created_at').unsigned().nullable()
    table.string('created_by', 31).nullable()

    table.double('found_at').unsigned().nullable()
    table.string('found_by', 31).nullable()

    table.double('lat').unsigned().nullable()
    table.double('lng').unsigned().nullable()

    table.string('room', 63).notNullable()
    table.json('json')
  })
}
exports.down = function(knex) {
  return knex.schema.dropTable('items')
}
