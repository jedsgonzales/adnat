class Organization < ApplicationRecord
  has_and_belongs_to_many :users
  has_many :shifts, -> { order(start_time: :desc) }

  def has_member?(user_id)
    users.exists?(user_id)
  end
end
