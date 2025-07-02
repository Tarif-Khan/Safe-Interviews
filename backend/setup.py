#!/usr/bin/env python3
"""
Setup script for Safe Interviews Backend
"""
import os
import subprocess
import sys
from pathlib import Path

def run_command(command, description):
    """Run a shell command and handle errors"""
    print(f"🚀 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"   Error: {e.stderr}")
        return False

def main():
    print("🎯 Safe Interviews Backend Setup")
    print("=" * 40)
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        sys.exit(1)
    
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    
    # Check if virtual environment exists
    venv_path = Path("venv")
    if not venv_path.exists():
        print("📦 Creating virtual environment...")
        if not run_command("python -m venv venv", "Virtual environment creation"):
            sys.exit(1)
    else:
        print("✅ Virtual environment already exists")
    
    # Determine activation command based on OS
    if os.name == 'nt':  # Windows
        activate_cmd = "venv\\Scripts\\activate"
        pip_cmd = "venv\\Scripts\\pip"
    else:  # Unix/Linux/MacOS
        activate_cmd = "source venv/bin/activate"
        pip_cmd = "venv/bin/pip"
    
    # Install dependencies
    print("📦 Installing dependencies...")
    if not run_command(f"{pip_cmd} install -r requirements.txt", "Dependencies installation"):
        sys.exit(1)
    
    # Create .env file if it doesn't exist
    env_file = Path(".env")
    if not env_file.exists():
        print("⚙️  Creating .env file...")
        try:
            with open("config.example.env", "r") as example:
                with open(".env", "w") as env:
                    env.write(example.read())
            print("✅ .env file created from template")
            print("⚠️  Please edit .env with your Supabase configuration")
        except FileNotFoundError:
            print("⚠️  config.example.env not found, creating basic .env")
            with open(".env", "w") as env:
                env.write("# Supabase Configuration\n")
                env.write("SUPABASE_URL=your_supabase_project_url\n")
                env.write("SUPABASE_ANON_KEY=your_supabase_anon_key\n")
                env.write("SUPABASE_JWT_SECRET=your_supabase_jwt_secret\n\n")
                env.write("# Server Configuration\n")
                env.write("PORT=8000\n")
                env.write("HOST=0.0.0.0\n")
    else:
        print("✅ .env file already exists")
    
    # Run tests
    print("🧪 Running tests...")
    if not run_command(f"{pip_cmd.replace('pip', 'python')} -m pytest test_app.py -v", "Tests"):
        print("⚠️  Some tests failed, but setup continues...")
    
    print("\n🎉 Setup completed!")
    print("\n📝 Next steps:")
    print("1. Edit .env with your Supabase configuration")
    print("2. Activate virtual environment:")
    print(f"   {activate_cmd}")
    print("3. Start the server:")
    print("   python start.py")
    print("\n🌐 The server will be available at http://localhost:8000")
    print("📖 See README.md for detailed documentation")

if __name__ == "__main__":
    main() 