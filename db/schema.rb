# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2019_09_18_053011) do

  create_table "organizations", force: :cascade do |t|
    t.string "name", null: false
    t.decimal "hourly_rate", default: "10.0", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "organizations_users", id: false, force: :cascade do |t|
    t.integer "organization_id", null: false
    t.integer "user_id", null: false
  end

  create_table "shifts", force: :cascade do |t|
    t.integer "user_id"
    t.integer "organization_id"
    t.datetime "start_time"
    t.datetime "end_time"
    t.text "breaks"
    t.decimal "shift_cost", default: "0.0"
    t.decimal "total_worked", default: "0.0"
    t.decimal "total_breaks", default: "0.0"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["organization_id"], name: "index_shifts_on_organization_id"
    t.index ["user_id"], name: "index_shifts_on_user_id"
  end

  create_table "user_tokens", force: :cascade do |t|
    t.integer "user_id"
    t.string "token", null: false
    t.datetime "expiry", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_user_tokens_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "name", null: false
    t.string "email", null: false
    t.string "password", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

end
