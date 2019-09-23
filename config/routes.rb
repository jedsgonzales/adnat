Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  root "static#index"

  namespace :api, defaults: { format: :json } do
    # post 'authenticate', to: 'login#authenticate'
    resources :users do
      resources :shifts

      resources :organizations do
        resources :shifts

        member do
          match 'leave', to: "organizations#leave", via: :get
          match 'join', to: "organizations#join", via: :get
        end
      end

      collection do
        match 'password-reset', to: "users#password_reset", via: :post
        match 'login', to: "users#login", via: [:get, :post]
        match 'authenticate', to: "users#authenticate", via: :post
        match 'get-session', to: "users#auth_by_token", via: [:get, :post]
      end
    end

    resources :organizations do
      resources :shifts
    end

    resources :shifts

  end

  get '*page', to: "static#index", constraints: ->(req) do
    !req.xhr? && req.format.html?
  end
end
