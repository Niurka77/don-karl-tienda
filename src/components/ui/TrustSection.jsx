import logoKB from '/kb.png'

const TrustSection = () => {
  return (
    <div className="bg-gradient-to-b from-kb-gray to-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-kb-pink/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-kb-gold/20 rounded-full blur-2xl" />
            
            <div className="relative bg-white p-8 rounded-3xl shadow-2xl">
              <img
                src={logoKB}
                alt="KB Dresses and More"
                className="w-full object-contain mb-6"
              />
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-kb-pink/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-kb-pink-dark" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">Tienda Física</p>
                    <p className="text-sm text-gray-600">Galería Chiclayo - 2do Piso</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-kb-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-kb-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">WhatsApp</p>
                    <p className="text-sm text-gray-600">+51 906 877 812</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <span className="inline-block bg-kb-pink/10 text-kb-pink-dark px-4 py-2 rounded-full text-sm font-semibold mb-4">
              SOBRE NOSOTROS
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-800 mb-6">
              Importamos Moda de Calidad desde <span className="text-kb-pink-dark">EE.UU.</span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              En <strong>KB Dresses & More</strong> nos especializamos en traer lo último en tendencias 
              de moda directamente desde Estados Unidos. Contamos con una amplia variedad de carteras, 
              vestidos de fiesta, billeteras y accesorios de las mejores marcas.
            </p>
            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-kb-pink-dark flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <div>
                  <p className="font-semibold text-gray-800">Productos 100% Originales</p>
                  <p className="text-sm text-gray-600">Guess, Tommy Hilfiger, Calvin Klein, Michael Kors</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-kb-pink-dark flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <div>
                  <p className="font-semibold text-gray-800">Envíos a Todo el Perú</p>
                  <p className="text-sm text-gray-600">Delivery seguro y rápido a cualquier ciudad</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-kb-pink-dark flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <div>
                  <p className="font-semibold text-gray-800">Atención Personalizada</p>
                  <p className="text-sm text-gray-600">Te ayudamos a encontrar lo que buscas</p>
                </div>
              </div>
            </div>
            <a
              href="https://wa.me/51906877812"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-kb-pink-dark text-white font-bold px-8 py-4 rounded-full hover:bg-kb-pink hover:scale-105 transition-all shadow-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Escríbenos por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrustSection