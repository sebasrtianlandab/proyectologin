#!/bin/bash
# Script para resetear la base de datos de usuarios

echo "🗑️  Limpiando base de datos..."

# Vaciar users.json
echo "[]" > data/users.json

# Vaciar otp.json
echo "[]" > data/otp.json

echo "✅ Base de datos limpia. Puedes registrarte de nuevo."
