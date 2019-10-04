exports.up = function(knex) {
  return knex.schema.table('players', function(table) {
    table.integer('points').nullable()
  })
}
exports.down = function(knex) {
  return knex.schema.dropTable('players')
}
