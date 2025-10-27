document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURACIÓN DE LA API DE GROQ ---
    const GROQ_API_URL = "/api/proxyGroq";

    // --- BASE DE DATOS DE DISTRITOS ---
    // Puedes añadir más distritos aquí fácilmente
    const districtData = {
        'jesus-maria': {
            name: 'Jesús María',
            description: 'Un distrito residencial, tranquilo y con excelente acceso. Conocido por sus parques, clínicas de prestigio y una vida familiar.',
            pois: 'Parque de la Reserva, Parque Hundido, Clínicas Anglo Americana y Delgado, acceso rápido a la Panamericana, cercano a Plaza San Miguel y la UNMSM.'
        },
        'miraflores': {
            name: 'Miraflores',
            description: 'El corazón financiero y turístico de Lima. Moderno, elegante y con una vibrante vida cultural y gastronómica. Ideal para quienes buscan lujo y comodidad.',
            pois: 'Larcomar, Malecón de Miraflores, Parque Kennedy, centros comerciales como Jockey Plaza, los mejores restaurantes, vida nocturna y acceso a la playa.'
        },
        'san-miguel': {
            name: 'San Miguel',
            description: 'Un distrito estratégico y comercial. Famoso por su gran centro comercial y su excelente conectividad, ofreciendo un balance entre vida urbana y zonas residenciales.',
            pois: 'Plaza San Miguel, Megaplaza, la PUCP, acceso directo a la Panamericana Sur y Norte, variedad de colegios y universidades.'
        },
        'san-borja': {
            name: 'San Borja',
            description: 'Un distrito planificado, verde y seguro. Reconocido por su alta calidad de vida, amplias áreas verdes y su enfoque en la cultura y la educación.',
            pois: 'Parque de la Amistad, Museo de la Nación, Biblioteca Nacional, sede del MINEDU, fácil acceso a la vía expresa.'
        },
        'pueblo-libre': {
            name: 'Pueblo Libre',
            description: 'Un distrito con un encanto histórico y bohemio. Famoso por sus museos, plazas tranquilas y una creciente oferta gastronómica.',
            pois: 'Museo Nacional de Arqueología, Antropología e Historia del Perú, Museo Larco, Plaza Bolívar, cercano a la UNMSM.'
        },
        'lince': {
            name: 'Lince',
            description: 'Un distrito céntrico y tradicional, en plena revitalización. Ofrece una ubicación inmejorable y un acceso rápido a los principales puntos de Lima.',
            pois: 'Cerca de Plaza San Miguel, Estadio Nacional, fácil acceso a avenidas como Arenales y Javier Prado, gran variedad de restaurantes y comercios.'
        }
    };

    // --- ELEMENTOS DEL DOM ---
    const districtSelect = document.getElementById('district-select'); // NUEVO
    const buyerProfileSelect = document.getElementById('buyer-profile');
    const buyerIncomeInput = document.getElementById('buyer-income');
    const propertyPriceInput = document.getElementById('property-price');
    const outputFormatSelect = document.getElementById('output-format');
    const generateBtn = document.getElementById('generate-btn');
    const imageIdeaBtn = document.getElementById('image-idea-btn');
    const outputArea = document.getElementById('output-area');
    const editBtn = document.getElementById('edit-btn');
    const saveBtn = document.getElementById('save-btn');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const contentTypeButtons = document.querySelectorAll('.btn-content-type');

    let selectedContentType = 'descripcion';
    let isEditing = false;

    // --- EVENT LISTENERS ---
    contentTypeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            contentTypeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedContentType = btn.dataset.type;
        });
    });

    generateBtn.addEventListener('click', generateContent);
    imageIdeaBtn.addEventListener('click', generateImageIdea);
    editBtn.addEventListener('click', toggleEdit);
    saveBtn.addEventListener('click', saveContent);
    clearHistoryBtn.addEventListener('click', clearHistory);

    loadHistory();

    // --- FUNCIONES PRINCIPALES ---

    async function generateContent() {
        const district = districtSelect.value; // NUEVO
        const profile = buyerProfileSelect.value;
        const income = buyerIncomeInput.value;
        const price = propertyPriceInput.value;
        const format = outputFormatSelect.value;
        const contentType = selectedContentType;

        const prompt = buildPrompt(district, profile, income, price, contentType, format); // MODIFICADO

        showLoading();
        try {
            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    messages: [
                        { role: "system", content: "Eres un experto copywriter y estratega de marketing inmobiliario en Perú. Tu tono es persuasivo, profesional y emocional. Creas contenido que conecta genuinamente con las necesidades y aspiraciones de los compradores." },
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 1024
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                let errorMessage = response.statusText;
                if (errorData.error && errorData.error.message) {
                    errorMessage += ` - ${errorData.error.message}`;
                }
                throw new Error(`Error en la API: (${response.statusText}) ${errorMessage}`);
            }

            const data = await response.json();
            const generatedText = data.choices[0].message.content.trim();
            outputArea.value = generatedText;
            isEditing = false;
            editBtn.textContent = "Editar";
            outputArea.readOnly = true;

        } catch (error) {
            outputArea.value = `Error al generar contenido: ${error.message}`;
            console.error(error);
        }
    }

    async function generateImageIdea() {
        const district = districtSelect.value; 
        const profile = buyerProfileSelect.value;
        const prompt = buildImagePrompt(district, profile);

        showLoading();
        try {
            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`
                },
                    body: JSON.stringify({
                    model: "llama-3.1-70b-versatile",
                    messages: [
                        { role: "system", content: "Eres un director de arte creativo. Genera ideas visuales concisas y potentes para campañas publicitarias." },
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.8,
                    max_tokens: 1024
                })
            });

            const data = await response.json();
            const generatedText = data.choices[0].message.content.trim();
            outputArea.value = `IDEA PARA IMAGEN:\n\n${generatedText}`;
            isEditing = false;
            editBtn.textContent = "Editar";
            outputArea.readOnly = true;

        } catch (error) {
            outputArea.value = `Error al generar idea: ${error.message}`;
            console.error(error);
        }
    }


    function buildPrompt(district, profile, income, price, contentType, format) {
        const districtInfo = districtData[district];
        const profileDetails = {
            'pareja-joven': "Parejas de profesionales recién casados (28+ años). Valoran la modernidad, la ubicación estratégica para su desarrollo profesional, la vida social y la comodidad. Buscan su primer hogar, una inversión inteligente y un espacio que refleje su estilo de vida activo.",
            'familia': "Parejas establecidas (45-55 años) con hijos en escuela o universidad (10-22 años). Su prioridad es la seguridad, la tranquilidad del barrio, la cercanía a buenos colegios, universidades, parques y servicios. Buscan un hogar funcional y duradero para su familia."
        };

        const contentTypeInstructions = {
            'descripcion': "Crea una descripción completa y atractiva para un portal inmobiliario. Inicia con un titular potente. Describe las características del departamento (2/3 dormitorios, 48-58 m²), los beneficios de la ubicación en el distrito seleccionado y cómo este espacio es perfecto para el perfil del comprador. Menciona la facilidad de pago (15-20 años) y cómo se ajusta a sus ingresos. Conecta el precio con el valor que ofrece.",
            'social': "Crea 3 opciones de mensaje corto y llamativo para redes sociales (Instagram/Facebook). Usa emojis relevantes. Incluye un llamado a la acción claro (ej: '¡Escríbenos para una visita!'). Enfócate en un solo beneficio clave por mensaje (ej: ubicación, estilo de vida, inversión).",
            'video': "Crea un guion para un video corto (30-45 segundos) para Reels/TikTok. Estructúralo en escenas: [ESCENA 1: Plano general del edificio o la zona], [NARRACIÓN: Texto en pantalla], etc. La música debe ser inspiradora. El mensaje debe ser rápido, visual y emocional, terminando con un llamado a la acción."
        };

        const formatInstruction = format === 'html'
            ? "Formatea la salida en HTML usando etiquetas como <h2> para títulos, <p> para párrafos, <ul> y <li> para listas, y <strong> para resaltar."
            : "Genera el contenido en texto plano, claro y bien estructurado.";

        const incomeText = income || "ingresos accesibles";
        const priceText = price || "un precio competitivo";

        return `
        DATOS DE LA PROPIEDAD:
        - Tipo: Departamentos nuevos de 2 y 3 dormitorios.
        - Ubicación: ${districtInfo.name}, Lima.
        - Área: 48 a 58 m².
        - Precio: ${priceText}.
        - Financiamiento: Plazo de 15 a 20 años.
        - Ingresos del comprador objetivo: ${incomeText} mensuales.

        INFORMACIÓN CLAVE DEL DISTRITO (${districtInfo.name}):
        - Descripción: ${districtInfo.description}
        - Puntos de Interés a resaltar: ${districtInfo.pois}

        PERFIL DEL COMPRADOR:
        - ${profileDetails[profile]}

        TAREA A REALIZAR:
        - ${contentTypeInstructions[contentType]}

        ENFOQUE:
        - Resalta los beneficios de vivir en ${districtInfo.name} usando los puntos de interés proporcionados.
        - Conecta las características del departamento con el estilo de vida y aspiraciones del perfil del comprador y el distrito elegido.

        FORMATO DE SALIDA:
        - ${formatInstruction}
        `;
    }

    // MODIFICADA para incluir el distrito
    function buildImagePrompt(district, profile) {
        const districtInfo = districtData[district];
        const profileDetails = {
            'pareja-joven': "una pareja joven y profesional disfrutando de las amenidades de su nuevo departamento en este distrito.",
            'familia': "una familia feliz creando recuerdos en su nuevo y espacioso departamento en este distrito."
        };
        return `Genera una idea creativa y detallada para una fotografía o ilustración publicitaria para la venta de departamentos en ${districtInfo.name}. Ten en cuenta que ${districtInfo.description}. La idea debe visualizar el siguiente concepto: ${profileDetails[profile]}. Describe la escena, la iluminación, los colores y la emoción que debe transmitir la imagen, integrando la esencia del distrito.`;
    }

    function showLoading() {
        outputArea.value = "Generando contenido, por favor espera...";
    }

    function toggleEdit() {
        isEditing = !isEditing;
        outputArea.readOnly = !isEditing;
        editBtn.textContent = isEditing ? "Guardar Cambios" : "Editar";
        if (!isEditing) {
            alert("Has salido del modo de edición. Si deseas guardar el contenido en el historial, haz clic en el botón 'Guardar'.");
        }
    }

    // MODIFICADA para guardar el distrito
    function saveContent() {
        const content = outputArea.value;
        if (!content) {
            alert("No hay contenido para guardar.");
            return;
        }

        const historyItem = {
            id: Date.now(),
            district: districtSelect.options[districtSelect.selectedIndex].text, // NUEVO
            profile: buyerProfileSelect.options[buyerProfileSelect.selectedIndex].text,
            income: buyerIncomeInput.value,
            price: propertyPriceInput.value,
            contentType: selectedContentType,
            content: content,
            date: new Date().toLocaleString()
        };

        let history = JSON.parse(localStorage.getItem('contentHistory')) || [];
        history.unshift(historyItem);
        localStorage.setItem('contentHistory', JSON.stringify(history));

        loadHistory();
        alert("Contenido guardado en el historial.");
    }

    // MODIFICADA para mostrar el distrito en el historial
    function loadHistory() {
        let history = JSON.parse(localStorage.getItem('contentHistory')) || [];
        historyList.innerHTML = '';

        if (history.length === 0) {
            historyList.innerHTML = "<p>No hay contenido guardado.</p>";
            return;
        }

        history.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-item';

            let metaInfo = `[${item.date}] - ${item.district} - ${item.profile} - ${item.contentType}`;
            if (item.income) metaInfo += ` - Ingresos: ${item.income}`;
            if (item.price) metaInfo += ` - Precio: ${item.price}`;

            div.innerHTML = `
                <div class="meta">${metaInfo}</div>
                <div>${item.content.substring(0, 100)}...</div>
            `;
            div.addEventListener('click', () => {
                outputArea.value = item.content;
                window.scrollTo({ top: document.querySelector('.output-section').offsetTop, behavior: 'smooth' });
            });
            historyList.appendChild(div);
        });
    }

    function clearHistory() {
        if (confirm("¿Estás seguro de que quieres eliminar todo el historial? Esta acción no se puede deshacer.")) {
            localStorage.removeItem('contentHistory');
            loadHistory();
        }
    }
});