class User < ApplicationRecord
  has_and_belongs_to_many :organizations
  has_many :shifts, -> { order(start_time: :desc) }
  has_many :user_tokens

  validates :name, presence: true, length: { minimum: 5 }
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, presence: true, length: { minimum: 6 }

end
