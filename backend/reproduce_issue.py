import requests
import time
import sys

BASE_URL = "http://localhost:8001/api"

def reproduce():
    # 1. Register/Login
    email = f"user_{int(time.time())}@example.com"
    password = "password123"
    
    print(f"Registering user: {email}")
    resp = requests.post(f"{BASE_URL}/auth/register", json={
        "email": email,
        "password": password,
        "full_name": "Campaign Tester"
    })
    if resp.status_code != 201:
        print(f"Registration failed: {resp.text}")
        # Try login if already exists
        pass
        
    print("Logging in...")
    resp = requests.post(f"{BASE_URL}/auth/login", json={
        "email": email,
        "password": password
    })
    if resp.status_code != 200:
        print(f"Login failed: {resp.text}")
        return
        
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Create Template
    print("Creating template...")
    resp = requests.post(f"{BASE_URL}/templates/", headers=headers, json={
        "name": "Test Template",
        "subject": "Hello {{name}}",
        "body": "<p>Hi {{name}}, this is a test email.</p>",
        "placeholders": ["name"]
    })
    if resp.status_code != 201:
        print(f"Template creation failed: {resp.text}")
        return
    template_id = resp.json()["id"]
    
    # 3. Create Contact
    print("Creating contact...")
    resp = requests.post(f"{BASE_URL}/contacts/", headers=headers, json={
        "email": "recipient@example.com",
        "first_name": "Jane",
        "last_name": "Doe"
    })
    if resp.status_code != 201:
        print(f"Contact creation failed: {resp.text}")
        return
    contact_id = resp.json()["id"]
    
    # 4. Create Campaign
    print("Creating campaign...")
    resp = requests.post(f"{BASE_URL}/campaigns/", headers=headers, json={
        "name": "Test Campaign",
        "template_id": template_id,
        "contact_ids": [contact_id]
    })
    if resp.status_code != 201:
        print(f"Campaign creation failed: {resp.text}")
        return
    campaign_id = resp.json()["id"]
    print(f"Campaign created with ID: {campaign_id}")
    
    # 5. Send Campaign
    print("Sending campaign...")
    resp = requests.post(f"{BASE_URL}/campaigns/{campaign_id}/send", headers=headers)
    if resp.status_code != 200:
        print(f"Send failed: {resp.text}")
        return
    print("Send request accepted.")
    
    # 6. Monitor Status
    print("Monitoring status (checking emails)...")
    for _ in range(10):
        time.sleep(2)
        resp = requests.get(f"{BASE_URL}/campaigns/{campaign_id}", headers=headers)
        campaign = resp.json()
        print(f"Campaign Status: {campaign['status']}, Stats: Sent={campaign['sent_count']}, Failed={campaign['failed_count']}")
        
        resp = requests.get(f"{BASE_URL}/campaigns/{campaign_id}/emails", headers=headers)
        emails = resp.json()
        for em in emails:
            print(f" - Email to {em['recipient_email']}: {em['status']}, Error: {em.get('error_message')}")
            
        if campaign['status'] in ['completed', 'failed']:
            break

if __name__ == "__main__":
    reproduce()
