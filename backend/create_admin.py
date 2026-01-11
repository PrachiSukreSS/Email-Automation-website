
import requests
import json
import sys

# API URL
API_URL = "http://localhost:8000/api/auth/register"

# User Data
user_data = {
    "email": "admin@example.com",
    "password": "AdminPassword123!",
    "full_name": "Admin User"
}

def create_admin():
    try:
        print(f"Attempting to create admin user at {API_URL}...")
        response = requests.post(API_URL, json=user_data)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 201:
            print("Successfully created admin user!")
            print(f"Email: {user_data['email']}")
            print(f"Password: {user_data['password']}")
            return True
        elif response.status_code == 400 and "Email already registered" in response.text:
            print("Admin user already exists.")
            return True
        else:
            print(f"Failed to create user. Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return False

if __name__ == "__main__":
    success = create_admin()
    if not success:
        sys.exit(1)
