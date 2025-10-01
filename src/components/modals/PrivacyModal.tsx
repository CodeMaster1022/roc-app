import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X } from "lucide-react"
import rocLogo from "@/assets/roc-logo.png"

interface PrivacyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const PrivacyModal = ({ open, onOpenChange }: PrivacyModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 flex flex-col">
        <DialogHeader className="p-6 pb-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <img src={rocLogo} alt="ROC" className="h-10 w-auto" />
          </div>
          <DialogTitle className="text-2xl font-bold text-foreground">Aviso de Privacidad</DialogTitle>
          <div className="text-sm text-muted-foreground mt-2">
            Última actualización: 1 de enero de 2025
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-6 py-6">
            <div className="prose prose-sm max-w-none space-y-8">
              
              <section className="border-b border-border pb-6">
                <h2 className="text-xl font-semibold mb-4 text-primary">INTRODUCCIÓN Y ALCANCE</h2>
                <p className="mb-4 text-muted-foreground leading-relaxed">
                  El presente aviso se da en cumplimiento a lo previsto en los artículos 3, fracción I, 8, 15, 16, 28 al 35, 36 y demás aplicables de la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, en los sucesivo "Ley de Protección de Datos Personales"; 1, 4, 9, 11, 12, fracción III, 14, 23, 24 a 27 y demás aplicables del Reglamento de la Ley Federal de Protección de Datos Personales en Posesión, en lo sucesivo el "Reglamento", así como cualquier otra normativa y reglamentos aplicables.
                </p>
              </section>

              <section className="border-b border-border pb-6">
                <h2 className="text-xl font-semibold mb-4 text-primary">1. La identidad y domicilio del responsable que los recaba</h2>
                <p className="mb-4 text-muted-foreground leading-relaxed">
                  RENT IN ONE CLICK SOCIEDAD ANÓNIMA PROMOTORA DE INVERSIÓN DE CAPITAL VARIABLE en lo sucesivo "ROC", es responsable del tratamiento legítimo, controlado e informado de sus Datos Personales, mismos que se compromete a tratar en apego a los principios establecidos en el artículo 6 de la Ley de Protección de Datos Personales y de conformidad con los propósitos establecidos en el presente Aviso de Privacidad.
                </p>
                <p className="mb-4 text-muted-foreground leading-relaxed">
                  Para el ejercicio de los derechos que les concede la Ley de Protección de Datos Personales, así como, limitar el uso o divulgación de sus Datos Personales, los Titulares (según se definen en el artículo 3 fracción XVII de la Ley de Protección de Datos Personales) podrán contactar a ROC mediante correo electrónico dirigido a: ayuda@roc.space.
                </p>
                <p className="mb-4 text-muted-foreground leading-relaxed">
                  ROC, sus empresas asociadas o controladoras conjuntamente, respetan la privacidad de toda persona que le proporcione sus Datos Personales al visitar o darse de alta como Cliente Roc o Usuario Roc en el sitio web https://www.roc.space/ y/o cualquier plataforma móvil perteneciente a ROC, y en forma conjunta como el "Sitio Web".
                </p>
              </section>

              <section className="border-b border-border pb-6">
                <h2 className="text-xl font-semibold mb-4 text-primary">2. RECOPILACIÓN, TRATAMIENTO DE SU INFORMACIÓN Y FINALIDADES</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3 text-foreground">2.1 Tratamiento de Datos Personales</h3>
                    <p className="mb-4 text-muted-foreground leading-relaxed">
                      El presente Aviso de Privacidad contempla la recolección y tratamiento de Datos Personales en el seno del Sitio Web. El tratamiento de los Datos Personales por parte de ROC es un requisito necesario para recibir servicios por parte de ROC, colaborar un contrato con ROC, participar en operaciones de arrendamiento en el Sitio Web o, en general, un requisito legal o de regulación para que ROC administre su relación contractual, por lo que es necesario solicitar su consentimiento, en términos de la legislación aplicable.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3 text-foreground">2.2 Datos Personales Recabados</h3>
                    <p className="mb-4 text-muted-foreground leading-relaxed">
                      Los Datos Personales que usted proporcione, a través del Sitio Web, serán aquellos que estrictamente sean necesarios para cumplir con los fines establecidos en el presente Aviso de Privacidad.
                    </p>
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <p className="text-sm font-medium text-foreground mb-3">Los Datos Personales que recaba ROC incluyen:</p>
                      <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-6">
                        <li>Nombre completo</li>
                        <li>Datos de su identificación oficial</li>
                        <li>Datos generales (edad, fecha de nacimiento, lugar de nacimiento)</li>
                        <li>Datos de contacto (teléfono, correo electrónico, domicilio)</li>
                        <li>Imágenes y/o fotografías de inmuebles</li>
                        <li>Documentos legales (escrituras, contratos, sentencias)</li>
                        <li>Registro Federal de Contribuyentes y CURP</li>
                        <li>Datos financieros y patrimoniales</li>
                        <li>Datos biométricos (huella dactilar, reconocimiento facial)</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3 text-foreground">2.3 Finalidades del Tratamiento</h3>
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <p className="text-sm font-medium text-foreground mb-3">Los Datos Personales serán tratados para:</p>
                      <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-6">
                        <li>Atender solicitudes y proveer servicios</li>
                        <li>Solicitar historial crediticio</li>
                        <li>Cumplir obligaciones contractuales</li>
                        <li>Mantener sistemas actualizados</li>
                        <li>Gestionar denuncias de irregularidades</li>
                        <li>Realizar auditorías e investigaciones</li>
                        <li>Proporcionar información vía telefónica o electrónica</li>
                        <li>Efectuar estudios de mercado</li>
                        <li>Cumplir con leyes y reglamentos aplicables</li>
                        <li>Fines de marketing y publicidad</li>
                        <li>Desarrollo de nuevas tecnologías</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              <section className="border-b border-border pb-6">
                <h2 className="text-xl font-semibold mb-4 text-primary">3. OTRA INFORMACIÓN – COOKIES Y BALIZAS WEB</h2>
                <p className="mb-4 text-muted-foreground leading-relaxed">
                  ROC utiliza cookies y tecnologías similares para ayudar a proporcionar, proteger y mejorar las plataformas tecnológicas propiedad de ROC.
                </p>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-3 text-foreground">¿Qué son las cookies?</h3>
                    <p className="mb-4 text-muted-foreground leading-relaxed">
                      Son pequeños archivos de texto que son enviados y almacenados en la computadora del usuario del Sitio Web de ROC. Sirven para reconocer, rastrear y almacenar datos relacionados con la navegación por internet.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3 text-foreground">¿Para qué utilizamos las cookies?</h3>
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-6">
                        <li>Proporcionar la mejor experiencia al recordar datos de acceso</li>
                        <li>Detectar fraudes</li>
                        <li>Garantizar la seguridad en la navegación</li>
                        <li>Proteger Datos Personales de terceros no autorizados</li>
                        <li>Realizar métricas de compromiso del Sitio Web</li>
                        <li>Comprender patrones de navegación</li>
                        <li>Autocompletar información en formularios</li>
                        <li>Mostrar publicidad más adecuada al interés del usuario</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              <section className="border-b border-border pb-6">
                <h2 className="text-xl font-semibold mb-4 text-primary">4. COMPARTIENDO SU INFORMACIÓN</h2>
                <p className="mb-4 text-muted-foreground leading-relaxed">
                  Los Datos Personales que nos proporcionen serán tratados con la más estricta confidencialidad. ROC podrá transferir sus Datos Personales únicamente en los siguientes casos:
                </p>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-6">
                    <li>Proveedores de servicios y terceros contratados por ROC</li>
                    <li>Empleados nacionales o extranjeros para mantenimiento de bases de datos</li>
                    <li>Autoridades nacionales y extranjeras competentes</li>
                    <li>Sede central y filiales</li>
                    <li>Empresas y asociaciones con las que ROC tiene contacto</li>
                    <li>Posibles arrendadores, arrendatarios, compradores, vendedores</li>
                    <li>Terceros nacionales o extranjeros para prestación de servicios</li>
                    <li>Entidades del Grupo Empresarial</li>
                  </ul>
                </div>
              </section>

              <section className="border-b border-border pb-6">
                <h2 className="text-xl font-semibold mb-4 text-primary">5. PROTECCIÓN DE SUS DATOS PERSONALES</h2>
                <p className="mb-4 text-muted-foreground leading-relaxed">
                  Para prevenir acceso no autorizado, mantener la precisión de los datos y asegurar el uso correcto de sus Datos Personales, ROC ha puesto en uso ciertos medios físicos, electrónicos, administrativos y procedimientos de seguridad para resguardar y asegurar los Datos Personales recopilados.
                </p>
                <p className="mb-4 text-muted-foreground leading-relaxed">
                  Los empleados de ROC son entrenados para comprender y cumplir con estos principios en materia de protección de Datos Personales y seguridad de la información.
                </p>
              </section>

              <section className="border-b border-border pb-6">
                <h2 className="text-xl font-semibold mb-4 text-primary">6. MENORES DE EDAD</h2>
                <p className="mb-4 text-muted-foreground leading-relaxed">
                  ROC no tiene intenciones de recopilar Datos Personales de menores de edad. Cuando corresponda, ROC les indicará específicamente a los menores que no brinden esos Datos Personales en nuestro Sitio Web y tomará medidas razonables para obtener el consentimiento de los padres, tutores o representantes legales.
                </p>
              </section>

              <section className="border-b border-border pb-6">
                <h2 className="text-xl font-semibold mb-4 text-primary">7. ENLACES EXTERNOS</h2>
                <p className="mb-4 text-muted-foreground leading-relaxed">
                  El Sitio Web puede contener links hacia y provenientes de otros sitios de Internet. ROC no es responsable por las prácticas de privacidad ni el tratamiento de los Datos Personales de esos sitios. ROC recomienda que consulten las prácticas de privacidad de dichos sitios de Internet antes de su utilización.
                </p>
              </section>

              <section className="border-b border-border pb-6">
                <h2 className="text-xl font-semibold mb-4 text-primary">8. DERECHOS DEL USUARIO – EJERCICIO DE DERECHOS ARCO</h2>
                <p className="mb-4 text-muted-foreground leading-relaxed">
                  Si usted ha proporcionado Datos Personales a ROC a través de los servicios disponibles en el Sitio Web, usted podrá acceder a la misma, revisar, modificar, eliminar y actualizar sus Datos Personales en el momento que lo desee.
                </p>
                <p className="mb-4 text-muted-foreground leading-relaxed">
                  Para ejercer los derechos de acceso, rectificación, cancelación u oposición, deberá presentar una solicitud por escrito debidamente firmada a ROC. ROC dará respuesta a cada solicitud en un plazo máximo de 20 (veinte) días hábiles.
                </p>
                <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                  <p className="text-sm font-medium text-foreground mb-2">Contacto para ejercer derechos ARCO:</p>
                  <p className="text-sm text-muted-foreground">ayuda@roc.space</p>
                </div>
              </section>

              <section className="border-b border-border pb-6">
                <h2 className="text-xl font-semibold mb-4 text-primary">9. CAMBIOS A ESTE AVISO DE PRIVACIDAD</h2>
                <p className="mb-4 text-muted-foreground leading-relaxed">
                  ROC se reserva el derecho a modificar este Aviso de Privacidad periódicamente, en cuyo caso el Aviso de Privacidad actualizado se publicará en este mismo Sitio Web, siendo obligación de los usuarios revisar regularmente esta sección a fin de informarse de cualquier cambio que se pueda haber producido.
                </p>
              </section>

              <section className="border-b border-border pb-6">
                <h2 className="text-xl font-semibold mb-4 text-primary">10. DOMICILIO</h2>
                <p className="mb-4 text-muted-foreground leading-relaxed">
                  RENT IN ONE CLICK SOCIEDAD ANÓNIMA PROMOTORA DE INVERSIÓN DE CAPITAL VARIABLE. El Sitio Web es https://www.roc.space/. El presente Aviso de Privacidad se rige por las leyes de los Estados Unidos Mexicanos.
                </p>
              </section>

              <section className="border-b border-border pb-6">
                <h2 className="text-xl font-semibold mb-4 text-primary">11. Contacto</h2>
                <p className="mb-4 text-muted-foreground leading-relaxed">
                  Si tiene preguntas sobre su privacidad cuando utilice el Sitio Web, por favor contáctenos al siguiente correo electrónico:
                </p>
                <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                  <p className="text-sm font-medium text-foreground">ayuda@roc.space</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-primary">12. QUEJAS Y DENUNCIAS</h2>
                <p className="mb-4 text-muted-foreground leading-relaxed">
                  Si usted considera que su derecho de protección de Datos Personales ha sido lesionado por alguna conducta de ROC o de nuestros empleados, o presume que en el tratamiento de sus Datos Personales existe alguna violación a las disposiciones previstas en la Ley de Protección de Datos personales y su Reglamento, podrá presentar una queja o denuncia ante el Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales (INAI).
                </p>
              </section>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
