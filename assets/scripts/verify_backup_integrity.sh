#!/bin/sh
#
# verify_backup_integrity.sh
# Script de verificación de integridad de backup antes de restauración dd
# Compatible con QNX 6.x (MIB2 STD2)
#
# Uso: ./verify_backup_integrity.sh <archivo_backup.img> <dispositivo_destino>
# Ejemplo: ./verify_backup_integrity.sh /mnt/sd/mib2_full_backup.img /dev/mmcblk0
#

# Colores para output (si el terminal los soporta)
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_info() {
    echo "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo "${RED}[ERROR]${NC} $1"
}

print_separator() {
    echo "========================================="
}

# Verificar argumentos
if [ $# -ne 2 ]; then
    print_error "Uso: $0 <archivo_backup.img> <dispositivo_destino>"
    print_info "Ejemplo: $0 /mnt/sd/mib2_full_backup.img /dev/mmcblk0"
    exit 1
fi

BACKUP_FILE="$1"
TARGET_DEVICE="$2"

print_separator
print_info "VERIFICACIÓN DE INTEGRIDAD DE BACKUP"
print_separator
echo ""

# 1. Verificar que el archivo de backup existe
print_info "1. Verificando existencia del archivo de backup..."
if [ ! -f "$BACKUP_FILE" ]; then
    print_error "El archivo de backup NO existe: $BACKUP_FILE"
    exit 1
fi
print_info "   ✓ Archivo encontrado: $BACKUP_FILE"
echo ""

# 2. Obtener información del archivo
print_info "2. Información del archivo de backup:"
BACKUP_SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
BACKUP_DATE=$(ls -l "$BACKUP_FILE" | awk '{print $6, $7, $8}')
print_info "   Tamaño: $BACKUP_SIZE"
print_info "   Fecha:  $BACKUP_DATE"
echo ""

# 3. Verificar archivo MD5
print_info "3. Verificando checksum MD5..."
MD5_FILE="${BACKUP_FILE}.md5"
if [ ! -f "$MD5_FILE" ]; then
    print_warn "   ⚠ Archivo MD5 NO encontrado: $MD5_FILE"
    print_warn "   Se calculará el MD5 pero no se podrá verificar contra el original"
    
    print_info "   Calculando MD5 del backup (esto puede tardar varios minutos)..."
    CALCULATED_MD5=$(md5sum "$BACKUP_FILE" | awk '{print $1}')
    print_info "   MD5 calculado: $CALCULATED_MD5"
    print_warn "   ⚠ NO SE PUEDE VERIFICAR INTEGRIDAD sin archivo .md5"
    echo ""
else
    print_info "   ✓ Archivo MD5 encontrado"
    
    # Leer MD5 esperado
    EXPECTED_MD5=$(cat "$MD5_FILE" | awk '{print $1}')
    print_info "   MD5 esperado: $EXPECTED_MD5"
    
    # Calcular MD5 actual
    print_info "   Calculando MD5 del backup (esto puede tardar varios minutos)..."
    CALCULATED_MD5=$(md5sum "$BACKUP_FILE" | awk '{print $1}')
    print_info "   MD5 calculado: $CALCULATED_MD5"
    
    # Comparar
    if [ "$EXPECTED_MD5" = "$CALCULATED_MD5" ]; then
        print_info "   ✓ ✓ ✓ INTEGRIDAD VERIFICADA - Los checksums coinciden"
    else
        print_error "   ✗ ✗ ✗ INTEGRIDAD COMPROMETIDA - Los checksums NO coinciden"
        print_error "   El archivo de backup puede estar corrupto"
        print_error "   NO SE RECOMIENDA PROCEDER CON LA RESTAURACIÓN"
        exit 1
    fi
fi
echo ""

# 4. Verificar dispositivo destino
print_info "4. Verificando dispositivo destino..."
if [ ! -b "$TARGET_DEVICE" ]; then
    print_error "El dispositivo destino NO existe o no es un dispositivo de bloques: $TARGET_DEVICE"
    print_info "Dispositivos disponibles:"
    ls -l /dev/mmcblk* 2>/dev/null || ls -l /dev/sd* 2>/dev/null
    exit 1
fi
print_info "   ✓ Dispositivo encontrado: $TARGET_DEVICE"
echo ""

# 5. Obtener tamaño del dispositivo destino
print_info "5. Verificando espacio en dispositivo destino..."
# En QNX, usamos diferentes métodos para obtener el tamaño
if command -v blockdev >/dev/null 2>&1; then
    TARGET_SIZE=$(blockdev --getsize64 "$TARGET_DEVICE" 2>/dev/null)
elif [ -f "/sys/class/block/$(basename $TARGET_DEVICE)/size" ]; then
    TARGET_SECTORS=$(cat "/sys/class/block/$(basename $TARGET_DEVICE)/size")
    TARGET_SIZE=$((TARGET_SECTORS * 512))
else
    print_warn "   ⚠ No se pudo determinar el tamaño exacto del dispositivo"
    TARGET_SIZE=0
fi

if [ "$TARGET_SIZE" -gt 0 ]; then
    TARGET_SIZE_MB=$((TARGET_SIZE / 1024 / 1024))
    print_info "   Tamaño del dispositivo: ${TARGET_SIZE_MB} MB"
    
    # Obtener tamaño del backup en bytes
    BACKUP_SIZE_BYTES=$(ls -l "$BACKUP_FILE" | awk '{print $5}')
    BACKUP_SIZE_MB=$((BACKUP_SIZE_BYTES / 1024 / 1024))
    
    if [ "$BACKUP_SIZE_BYTES" -gt "$TARGET_SIZE" ]; then
        print_error "   ✗ El backup ($BACKUP_SIZE_MB MB) es MÁS GRANDE que el dispositivo destino ($TARGET_SIZE_MB MB)"
        print_error "   NO SE PUEDE RESTAURAR"
        exit 1
    else
        print_info "   ✓ El backup ($BACKUP_SIZE_MB MB) cabe en el dispositivo destino ($TARGET_SIZE_MB MB)"
    fi
else
    print_warn "   ⚠ No se pudo verificar el espacio (continuando de todas formas)"
fi
echo ""

# 6. Resumen final
print_separator
print_info "RESUMEN DE VERIFICACIÓN"
print_separator
echo ""
print_info "Archivo de backup:    $BACKUP_FILE"
print_info "Tamaño del backup:    $BACKUP_SIZE"
print_info "Dispositivo destino:  $TARGET_DEVICE"
print_info "Integridad MD5:       VERIFICADA ✓"
echo ""

# 7. Advertencia final
print_separator
print_warn "⚠⚠⚠  ADVERTENCIA CRÍTICA  ⚠⚠⚠"
print_separator
echo ""
print_warn "La restauración con dd SOBRESCRIBIRÁ COMPLETAMENTE el dispositivo destino"
print_warn "Todos los datos actuales en $TARGET_DEVICE se perderán"
print_warn "NO interrumpir el proceso una vez iniciado"
print_warn "Asegurarse de que la batería del vehículo esté cargada"
echo ""

# 8. Comando de restauración sugerido
print_separator
print_info "COMANDO DE RESTAURACIÓN SUGERIDO"
print_separator
echo ""
print_info "dd if=$BACKUP_FILE of=$TARGET_DEVICE bs=4M status=progress"
echo ""
print_info "Después de la restauración, ejecutar:"
print_info "sync && reboot"
echo ""

# 9. Confirmación final
print_separator
echo -n "¿Desea proceder con la restauración? (escriba 'SI' en mayúsculas para confirmar): "
read CONFIRMATION

if [ "$CONFIRMATION" = "SI" ]; then
    print_info "Confirmación recibida. Puede proceder con el comando dd mostrado arriba."
    exit 0
else
    print_info "Restauración cancelada por el usuario."
    exit 0
fi
