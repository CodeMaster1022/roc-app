import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X } from "lucide-react"
import rocLogo from "@/assets/roc-logo.png"

interface TermsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const TermsModal = ({ open, onOpenChange }: TermsModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 flex flex-col">
        <DialogHeader className="p-6 pb-4 border-b border-border flex-shrink-0">
          <DialogTitle className="text-2xl font-bold text-foreground">Términos y Condiciones de Uso</DialogTitle>
          <div className="text-sm text-muted-foreground mt-2">
            Última actualización: 1 de enero de 2025
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-6 py-6">
          <div className="prose prose-sm max-w-none space-y-8">

            <section className="border-b border-border pb-6">
              <h2 className="text-xl font-semibold mb-4 text-primary">1. Introducción</h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                Los Presentes términos y condiciones de uso ("Términos y Condiciones de Uso"), disponibles en el sitio de internet https://www.roc.space/terminos-y-condiciones, es un contrato legal y vinculante que regula su acceso a la plataforma y sitios de internet y sus contenidos, rige el derecho a usar los sitios web, las aplicaciones y otros ofrecimientos de ROC, así como a los productos y servicios en general que son operados, puestos a disposición y/o prestados por ROC.
              </p>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                Al acceder, crear una cuenta, llenar un formulario, iniciar sesión y/o utilizar la Plataforma ROC, para prospectar, adquirir o contratar cualquiera de los Servicios ofrecidos por ROC, usted reconoce que entiende y acepta de manera expresa, irrevocable e incondicional todos los Términos y Condiciones así como cualquier otro documento incorporado por referencia a los mismos, los cuales crean, forman, establecen y regulan la relación contractual entre cualquier usuario o beneficiario de la Plataforma ROC y/o de los Servicios ROC, incluyendo, sin limitar, cualquier Huésped, asesor y/o prestador de servicios (cada uno, un "Usuario ROC" o "Cliente ROC"), y ROC, y que está sujeto a ellos.
              </p>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                Asimismo, el Usuario ROC acepta y reconoce que podrá aceptar los presentes Términos y Condiciones y/u otorgar su consentimiento para que ROC realice consultas sobre su historial crediticio a cualquier sociedad de información crediticia, mediante los siguientes medios electrónicos, incluyendo sin limitación: (a) el uso de un número de identificación personal (NIP); y/o (b) empresa electrónica, respaldada por un certificado digital válido y vigente emitido por un proveedor de servicios acreditado de acuerdo con la legislación mexicana; y/o (c) mediante la firma autógrafa y/o electrónica. El uso de dichos métodos será jurídicamente vinculante.
              </p>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                Si no acepta los Términos y Condiciones, el Usuario no podrá acceder ni utilizar la Plataforma ROC ni tampoco adquirir o contratar los Servicios ROC, reservándose éste último el derecho a no prestar los Servicios ROC a cualquier persona que no acepte en su totalidad los presentes Términos y Condiciones, según se actualicen los mismos, o bien que no cumpla con los demás requisitos que ROC establezca para sus Clientes ROC o Usuarios ROC.
              </p>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                ROC podrá modificar en cualquier momento, de manera unilateral y discrecional, los Términos y Condiciones, así como cualquier documento incorporado en la plataforma, y dichos cambios serán efectivos inmediatamente después de la publicación de la versión actualizada de los Términos y Condiciones en el dominio https://www.roc.space
              </p>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                Los Clientes ROC o Usuarios ROC reconocen que ROC no estará obligado a notificar personalmente sobre los cambios a los Términos y Condiciones, pero si está obligado a tenerlos a disposición en el sitio web.
              </p>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                El hecho de que cualquier Clientes ROC o Usuarios ROC continúe accediendo o utilizando la Plataforma ROC, o recibiendo o beneficiándose de cualquier Servicio ROC después de dicha publicación, dicho acceso o uso será considerado como su reconocimiento expreso, entendimiento y aceptación de los Términos y Condiciones actualizados. Sin perjuicio de lo anterior, como requisito para continuar permitiendo acceso y/o uso a las Plataformas ROC o a los Servicios ROC, ROC podrá, en cualquier momento y a su entera discreción, solicitar que cualquier Clientes ROC o Usuarios ROC consienta expresamente los cambios a los Términos y Condiciones.
              </p>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                En caso de que cualquier Clientes ROC o Usuarios ROC se oponga a las modificaciones de los Términos y Condiciones o, cuando le sea requerido, no otorgue su aceptación expresa a dichas modificaciones, ROC estará facultado para, en cualquier momento y a su entera discreción, suspender o terminar el acceso o uso de las Plataformas ROC y/o la prestación o puesta a disposición de los Servicios ROC a dichos Clientes ROC o Usuarios ROC.
              </p>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                ROC pone a disposición de los Clientes ROC o Usuarios ROC diversos opciones de productos y servicios que, en caso de contratación, se regirán por los contratos, acuerdos y convenios específicos que sean celebrados entre las partes (los "Contratos"), por estos Términos y Condiciones y por cualquier término específico adicional, conforme lo descrito en dichos Contratos. Las partes reconocen que, en caso de conflicto entre disposiciones de dichos Contratos y los presentes Términos y Condiciones, prevalecerá lo previsto en los Contratos.
              </p>
            </section>

            <section className="border-b border-border pb-6">
              <h2 className="text-xl font-semibold mb-4 text-primary">2. Definiciones</h2>
              <p className="mb-6 text-muted-foreground leading-relaxed">
                Para efectos de los presentes Términos y Condiciones de Uso, se utilizarán las siguientes conceptos que tendrán el significado que se les atribuye en este instrumento:
              </p>
              <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
                <p className="text-sm leading-relaxed"><strong className="text-foreground">Anuncio.-</strong> <span className="text-muted-foreground">Significa cualquier publicación en la Plataforma "Roc", ofreciendo el servicio de hospedaje privado de bienes inmuebles para uso habitacional y su ubicación;</span></p>
                
                <p className="text-sm leading-relaxed"><strong className="text-foreground">Arrendador Roc.-</strong> <span className="text-muted-foreground">Es aquella persona física o moral que da en arrendamiento un bien inmueble a través de la plataforma de Roc;</span></p>
                
                <p className="text-sm leading-relaxed"><strong className="text-foreground">Arrendatarios Roc.-</strong> <span className="text-muted-foreground">Es aquella persona física o moral que como Cliente Roc o Usuario Roc, contrate un servicio de hospedaje privado de bienes inmuebles;</span></p>
                
                <p className="text-sm leading-relaxed"><strong className="text-foreground">Comunicación.-</strong> <span className="text-muted-foreground">Significa cualquier comunicación o notificación, llamada telefónica, correo electrónico, mensajes, notificaciones instantáneas (push) o de cualquier manera enviado a través de la Plataforma Roc, mensajes de texto (SMS) o cualquier otra comunicación que, se instrumente y se utilice a través de la plataforma de "Roc";</span></p>
                
                <p className="text-sm leading-relaxed"><strong className="text-foreground">Contrato de Arrendamiento.-</strong> <span className="text-muted-foreground">Significa cualquier Contrato de Arrendamiento que sea celebrado entre un Arrendador y un Arrendatario respecto de un Inmueble, a través de la Plataforma de ROC o de cualquier otra forma, con participación directa de ROC;</span></p>
                
                <p className="text-sm leading-relaxed"><strong className="text-foreground">Clientes ROC o Usuarios ROC.-</strong> <span className="text-muted-foreground">Significa cualquier persona, que, en carácter de cliente o usuario registrado, celebre un Contrato de Hospedaje respecto de un espacio y/o recamara, a través de la Plataforma ROC;</span></p>
                
                <p className="text-sm leading-relaxed"><strong className="text-foreground">Huésped Roc.-</strong> <span className="text-muted-foreground">Significa cualquier persona, que, en carácter de cliente o usuario registrado, celebre un Contrato de Hospedaje respecto de un espacio y/o recamara, a través de la Plataforma de ROC;</span></p>
                
                <p className="text-sm leading-relaxed"><strong className="text-foreground">Inmueble.-</strong> <span className="text-muted-foreground">Significa cualquier bien inmueble que sea otorgado y que cumpla con las condiciones para el objeto y finalidades de aprovechamiento a través de la Plataforma de Roc.</span></p>
                
                <p className="text-sm leading-relaxed"><strong className="text-foreground">Propietario Roc.-</strong> <span className="text-muted-foreground">Es cualquier persona, física o moral, que tenga el carácter de legal propietario de uno o varios bienes inmuebles destinados al propósito y finalidades de la plataforma de Roc.</span></p>
                
                <p className="text-sm leading-relaxed"><strong className="text-foreground">Verificación.-</strong> <span className="text-muted-foreground">Significa la constatación y revisión de las condiciones físicas y aparentes de un Inmueble y de los elementos que la integran (incluyendo muebles fijos, muebles incorporados para baño y/o cocina, entre otros), que serán realizadas de conformidad con lo establecido en los contratos correspondientes, al inicio del y al final de este, por personal de Roc.</span></p>
              </div>
            </section>

            <section className="border-b border-border pb-6">
              <h2 className="text-xl font-semibold mb-4 text-primary">3. Uso de la Plataforma de ROC</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3 text-foreground">3.1. Acceso a la Plataforma ROC</h3>
                  <p className="mb-4 text-muted-foreground leading-relaxed">
                    Para el acceso y uso de la Plataforma de ROC, es necesario acceder a la pagina web, realizar registro y/ol suscripción como Cliente Roc o Usuario Roc, ya que resulta necesario para la contratación de los Servicios ROC, ofrecidos a través de la Plataforma de ROC, y para los efectos del pago de los servicios que se lleguen a contratar.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3 text-foreground">3.2 Capacidad</h3>
                  <p className="mb-4 text-muted-foreground leading-relaxed">
                    Podrán usar la Plataforma Roc y contratar los Servicios Roc todas las personas mayores de edad que tengan capacidad legal para contratar conforme al Código Civil Federal y/o la legislación aplicable, y de conformidad con estos Términos y Condiciones.
                  </p>
                  <p className="mb-4 text-muted-foreground leading-relaxed">
                    Cuando la suscripción y registro se realice en representación de una persona moral, deberá acreditar documentalmente tener facultades y capacidad para contratar a nombre de ella de conformidad con la legislación aplicable.
                  </p>
                  <p className="mb-4 text-muted-foreground leading-relaxed">
                    Así, al utilizar la Plataforma de ROC o considerarse como Cliente Roc o Usuario Roc, usted declara bajo protesta de decir verdad y garantiza que tiene capacidad legal para contratar conforme a la legislación. Queda prohibido el uso de la Plataforma Roc y/o de los Servicios Roc por personas que carezcan de capacidad legal para contratar, o se trate de menores de edad ya que legalmente no son capaces para ser sujetos de derechos y obligaciones.
                  </p>
                </div>
                
                                 <div>
                   <h3 className="text-lg font-medium mb-3 text-foreground">3.3. Datos personales</h3>
                   <p className="mb-4 text-muted-foreground leading-relaxed">
                     Al realizar la suscripción y registro en la Plataforma de Roc, se le pedirá que entregue y transmita a Roc, ciertos datos y documentos personales que incluirá, entre otras, nombre (s) y apellidos, domicilio, teléfono fijo y móvil y una dirección válida de correo electrónico, entre otros. De igual forma Roc solicitará la entrega digital de documentación y podrá requerir autorización para obtener cierta información adicional o complementaria relacionada con el Cliente Roc o Usuario Roc.
                   </p>
                   <p className="mb-4 text-muted-foreground leading-relaxed">
                     Roc pondrá a disposición del Cliente Roc o Usuario Roc, diversos servicios y productos adicionales proporcionados por terceros basados en las preferencias que el Cliente Roc o Usuario Roc requiera en cualquier momento; para lo cual Roc podrá transferir a dichos terceros la información proporcionada por el Cliente Roc o Usuario Roc de conformidad con el Aviso de Privacidad, salvo que el Cliente Roc o Usuario Roc, por lo que desde este momento otorga su consentimiento para tal efecto.
                   </p>
                   <p className="mb-4 text-muted-foreground leading-relaxed">
                     Así mismo, Cliente Roc o Usuario Roc entiende que en términos de su Aviso de Privacidad está autorizado a Roc para compartir con terceros la información que le sea entregada o transmitida que tenga relación con la prestación de los Servicios Roc, en términos del Aviso de Privacidad de Roc en donde se establece la forma en que se llevará el tratamiento de sus Datos Personales.
                   </p>
                   <p className="mb-4 text-muted-foreground leading-relaxed">
                     El Cliente Roc o Usuario Roc será responsable de todos los usos de su cuenta, tanto si están autorizados o no. En consecuencia, deberá notificar inmediatamente a Roc sobre cualquier uso sin autorización de su cuenta o contraseña. Los Cliente Roc o Usuario Roc registrados que utilicen los Servicios Roc garantizan la veracidad, exactitud, vigencia y autenticidad de sus datos personales, y se comprometen a mantenerlos debidamente actualizados, informando a Roc sobre cualquier cambio o modificación.
                   </p>
                   <p className="mb-4 text-muted-foreground leading-relaxed">
                     Todos los Cliente Roc o Usuario Roc reconocen y aceptan que Roc, en la medida en que lo permita la legislación aplicable, así como el Aviso de Privacidad de Roc, y la Legislación de Protección de Datos Personales, podrá generar una calificación de su perfil.
                   </p>
                 </div>
               </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-primary">Información de Contacto</h2>
              <p className="mb-6 text-muted-foreground leading-relaxed">
                Si tiene alguna pregunta sobre estos Términos y Condiciones, por favor contáctenos:
              </p>
              <div className="bg-primary/5 border border-primary/20 p-6 rounded-lg">
                <p className="font-semibold text-foreground text-lg mb-2">ROC</p>
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Email:</strong> legal@roc.space
                  </p>
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Sitio web:</strong> 
                    <a href="https://www.roc.space" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                      https://www.roc.space
                    </a>
                  </p>
                </div>
              </div>
            </section>
                      </div>
          </ScrollArea>
        </div>
        </DialogContent>
      </Dialog>
    )
} 