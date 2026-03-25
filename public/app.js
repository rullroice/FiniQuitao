document.addEventListener('DOMContentLoaded', () => {
    const inputSueldo   = document.getElementById('inputSueldo');
    const inputFoto     = document.getElementById('inputFoto');
    const btnEnviar     = document.getElementById('btnEnviar');
    const btnText       = document.getElementById('btnText');
    const selectAFP     = document.getElementById('selectAFP');
    const inputAfpTasa  = document.getElementById('inputAfpTasa');
    const selectSistema = document.getElementById('selectSistema');

    window.toggleAFP = function() {
        const sistema  = selectSistema.value;
        const grupoAFP = document.getElementById('grupo-afp');
        grupoAFP.style.display = sistema === 'AFP' ? 'block' : 'none';
        actualizarCalculos();
    };


    window.actualizarCalculos = function() {
        const bruto   = parseFloat(inputSueldo.value) || 0;
        const sistema = selectSistema.value;

        let tasaAFP  = 0;
        let labelPct = '0%';

        if (sistema === 'AFP') {
            const opcion = selectAFP.options[selectAFP.selectedIndex];
            tasaAFP  = parseFloat(opcion.dataset.tasa) || 0;
            labelPct = (tasaAFP * 100).toFixed(2) + '%';
            inputAfpTasa.value = tasaAFP;
        } else {
            inputAfpTasa.value = 0;
        }

        const afp      = bruto * tasaAFP;
        const salud    = bruto * 0.07;
        const cesantia = bruto * 0.006;
        const liquido  = bruto - afp - salud - cesantia;

        document.getElementById('label-afp-pct').textContent  = `Descuento AFP (${labelPct})`;
        document.getElementById('label-afp').innerText        = formatCLP(afp);
        document.getElementById('label-salud').innerText      = formatCLP(salud);
        document.getElementById('label-cesantia').innerText   = formatCLP(cesantia);
        document.getElementById('label-liquido').innerText    = formatCLP(liquido);
    };

    const formatCLP = (val) => new Intl.NumberFormat('es-CL', {
        style: 'currency', currency: 'CLP', maximumFractionDigits: 0
    }).format(val);

    inputSueldo.addEventListener('input', actualizarCalculos);
    selectAFP.addEventListener('change', actualizarCalculos);
    actualizarCalculos();


    inputFoto.addEventListener('change', function() {
        const file = this.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const container = document.getElementById('avatar-container');
            container.innerHTML = `<img src="${e.target.result}" style="width:100%; height:100%; object-fit:cover;">`;
        };
        reader.readAsDataURL(file);
    });


    btnEnviar.addEventListener('click', async () => {
        const form = document.getElementById('form');
        if (!form.checkValidity()) return form.reportValidity();

        btnEnviar.disabled = true;
        btnText.innerText  = '⏳ Generando PDF...';

        try {
            const formData = new FormData(form);
            const response = await fetch('/api/finiquito', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Error en el servidor');
            }

            const blob = await response.blob();
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href     = url;
            a.download = `Finiquito_${formData.get('nombre').replace(/\s+/g, '_')}.pdf`;
            a.click();
            URL.revokeObjectURL(url);

        } catch (error) {
            alert('❌ Error: ' + error.message);
        } finally {
            btnEnviar.disabled = false;
            btnText.innerText  = 'Generar Finiquito PDF';
        }
    });


const btnPollo        = document.getElementById('btnPollo');
const modalPollo      = document.getElementById('modalPollo');
const inputPollo      = document.getElementById('inputPollo');
const btnCancelar     = document.getElementById('btnCancelarPollo');
const btnConfirmar    = document.getElementById('btnConfirmarPollo');
const modalError      = document.getElementById('modalError');
const polloPantalla   = document.getElementById('polloPantalla');
const btnCerrarPollo  = document.getElementById('btnCerrarPollo');

btnPollo.addEventListener('click', () => {
    inputPollo.value = '';
    modalError.style.display = 'none';
    modalPollo.style.display = 'flex';
    setTimeout(() => inputPollo.focus(), 50);
});

btnCancelar.addEventListener('click', () => {
    modalPollo.style.display = 'none';
});

const intentarEntrar = () => {
    const val = inputPollo.value.trim().toLowerCase();
    if (val === 'pio') {
        modalPollo.style.display  = 'none';
        polloPantalla.style.display = 'flex';
    } else {
        modalError.style.display = 'block';
        inputPollo.value = '';
        inputPollo.focus();
    }
};

btnConfirmar.addEventListener('click', intentarEntrar);
inputPollo.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') intentarEntrar();
});

btnCerrarPollo.addEventListener('click', () => {
    polloPantalla.style.display = 'none';
});
});