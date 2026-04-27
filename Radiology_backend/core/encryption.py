from cryptography.fernet import Fernet
from core.config import settings
import base64
import hashlib


class EncryptionService:
    
    def __init__(self):
        key = hashlib.sha256(settings.ENCRYPTION_KEY.encode()).digest()
        key = base64.urlsafe_b64encode(key)
        self.cipher = Fernet(key)
    
    def encrypt(self, data: str) -> str:
        if not data:
            return data
        encrypted_data = self.cipher.encrypt(data.encode('utf-8'))
        return encrypted_data.decode('utf-8')
    
    def decrypt(self, encrypted_data: str) -> str:
        if not encrypted_data:
            return encrypted_data
        try:
            decrypted_data = self.cipher.decrypt(encrypted_data.encode('utf-8'))
            return decrypted_data.decode('utf-8')
        except Exception as e:
            raise ValueError(f"Decryption failed: {str(e)}")
    
    def encrypt_file(self, file_path: str, encrypted_path: str):
        with open(file_path, 'rb') as file:
            file_data = file.read()
        
        encrypted_data = self.cipher.encrypt(file_data)
        
        with open(encrypted_path, 'wb') as file:
            file.write(encrypted_data)
    
    def decrypt_file(self, encrypted_path: str, decrypted_path: str):
        with open(encrypted_path, 'rb') as file:
            encrypted_data = file.read()
        
        decrypted_data = self.cipher.decrypt(encrypted_data)
        
        with open(decrypted_path, 'wb') as file:
            file.write(decrypted_data)


encryption_service = EncryptionService()
