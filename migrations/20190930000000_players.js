exports.up = function(knex) {
  return knex.schema.createTable('players', function(table) {
    table.string('id', 31).notNullable().primary()

    table.double('created_at').unsigned().nullable()

    table.double('lat').unsigned().nullable()
    table.double('lng').unsigned().nullable()

    table.string('room', 63).notNullable()
    table.json('json')
  })
}
exports.down = function(knex) {
  return knex.schema.dropTable('players')
}
