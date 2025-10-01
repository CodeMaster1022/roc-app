import { ScrollArea } from "@/components/ui/scroll-area"
import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import rocLogo from "@/assets/roc-logo.png"

const TermsPage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </button>
            <img src={rocLogo} alt="ROC" className="h-8 w-auto" />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Términos y Condiciones de Uso</h1>
            <p className="text-sm text-muted-foreground">Última actualización: 1 de enero de 2025</p>
          </div>

          <ScrollArea className="max-h-[calc(100vh-200px)]">
            <div className="prose prose-sm max-w-none space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-4">1. Introducción</h2>
                <p className="mb-4">
                  Los Presentes términos y condiciones de uso ("Términos y Condiciones de Uso"), disponibles en el sitio de internet https://www.roc.space/terminos-y-condiciones, es un contrato legal y vinculante que regula su acceso a la plataforma y sitios de internet y sus contenidos, rige el derecho a usar los sitios web, las aplicaciones y otros ofrecimientos de ROC, así como a los productos y servicios en general que son operados, puestos a disposición y/o prestados por ROC.
                </p>
                <p className="mb-4">
                  Al acceder, crear una cuenta, llenar un formulario, iniciar sesión y/o utilizar la Plataforma ROC, para prospectar, adquirir o contratar cualquiera de los Servicios ofrecidos por ROC, usted reconoce que entiende y acepta de manera expresa, irrevocable e incondicional todos los Términos y Condiciones así como cualquier otro documento incorporado por referencia a los mismos, los cuales crean, forman, establecen y regulan la relación contractual entre cualquier usuario o beneficiario de la Plataforma ROC y/o de los Servicios ROC, incluyendo, sin limitar, cualquier Huésped, asesor y/o prestador de servicios (cada uno, un "Usuario ROC" o "Cliente ROC"), y ROC, y que está sujeto a ellos.
                </p>
                <p className="mb-4">
                  ROC podrá modificar en cualquier momento, de manera unilateral y discrecional, los Términos y Condiciones, así como cualquier documento incorporado en la plataforma, y dichos cambios serán efectivos inmediatamente después de la publicación de la versión actualizada de los Términos y Condiciones en el dominio https://www.roc.space
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">2. Definiciones</h2>
                <p className="mb-4">
                  Para efectos de los presentes Términos y Condiciones de Uso, se utilizarán las siguientes conceptos que tendrán el significado que se les atribuye en este instrumento:
                </p>
                <div className="space-y-4">
                  <p><strong>Clientes ROC o Usuarios ROC.-</strong> Significa cualquier persona, que, en carácter de cliente o usuario registrado, celebre un Contrato de Hospedaje respecto de un espacio y/o recamara, a través de la Plataforma ROC;</p>
                  <p><strong>Huésped Roc.-</strong> Significa cualquier persona, que, en carácter de cliente o usuario registrado, celebre un Contrato de Hospedaje respecto de un espacio y/o recamara, a través de la Plataforma de ROC;</p>
                  <p><strong>Inmueble.-</strong> Significa cualquier bien inmueble que sea otorgado y que cumpla con las condiciones para el objeto y finalidades de aprovechamiento a través de la Plataforma de Roc.</p>
                  <p><strong>Propietario Roc.-</strong> Es cualquier persona, física o moral, que tenga el carácter de legal propietario de uno o varios bienes inmuebles destinados al propósito y finalidades de la plataforma de Roc.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">3. Uso de la Plataforma de ROC</h2>
                
                <h3 className="text-lg font-medium mb-3">3.1. Acceso a la Plataforma ROC</h3>
                <p className="mb-4">
                  Para el acceso y uso de la Plataforma de ROC, es necesario acceder a la pagina web, realizar registro y/ol suscripción como Cliente Roc o Usuario Roc, ya que resulta necesario para la contratación de los Servicios ROC, ofrecidos a través de la Plataforma de ROC, y para los efectos del pago de los servicios que se lleguen a contratar.
                </p>
                
                <h3 className="text-lg font-medium mb-3">3.2 Capacidad</h3>
                <p className="mb-4">
                  Podrán usar la Plataforma Roc y contratar los Servicios Roc todas las personas mayores de edad que tengan capacidad legal para contratar conforme al Código Civil Federal y/o la legislación aplicable, y de conformidad con estos Términos y Condiciones.
                </p>
                
                <h3 className="text-lg font-medium mb-3">3.3. Datos personales</h3>
                <p className="mb-4">
                  Al realizar la suscripción y registro en la Plataforma de Roc, se le pedirá que entregue y transmita a Roc, ciertos datos y documentos personales que incluirá, entre otras, nombre (s) y apellidos, domicilio, teléfono fijo y móvil y una dirección válida de correo electrónico, entre otros.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">Información de Contacto</h2>
                <p className="mb-4">
                  Si tiene alguna pregunta sobre estos Términos y Condiciones, por favor contáctenos:
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <p><strong>ROC</strong></p>
                  <p>Email: legal@roc.space</p>
                  <p>Sitio web: https://www.roc.space</p>
                </div>
              </section>
            </div>
          </ScrollArea>
        </div>
      </main>
    </div>
  )
}

export default TermsPage 