/**
 * Terms of Use for MIB2 Controller
 * Includes translations in Spanish (ES), English (EN), and German (DE)
 */

export interface TermsOfUse {
  title: string;
  lastUpdated: string;
  sections: {
    title: string;
    content: string;
  }[];
}

export const termsOfUse: Record<'es' | 'en' | 'de', TermsOfUse> = {
  es: {
    title: 'Términos de Uso',
    lastUpdated: '16 de enero de 2026',
    sections: [
      {
        title: '1. Aceptación de los Términos',
        content: 'Al descargar, instalar o utilizar MIB2 Controller ("la Aplicación"), usted acepta estar sujeto a estos Términos de Uso. Si no está de acuerdo con estos términos, no utilice la Aplicación.',
      },
      {
        title: '2. Alcance y Propósito de la Aplicación',
        content: 'MIB2 Controller es una herramienta de diagnóstico y configuración local autorizada por el propietario para unidades de infotainment MIB2 STD2 del Grupo Volkswagen (variantes Technisat/Preh). La Aplicación está diseñada exclusivamente para uso en hardware de infotainment propiedad del usuario y requiere acceso físico al entorno del vehículo y una ruta de conexión local directa (por ejemplo, adaptador USB a Ethernet).',
      },
      {
        title: '3. Autorización del Propietario',
        content: 'Usted declara y garantiza que:\n\n(a) Es el propietario legal del vehículo y la unidad de infotainment en la que utilizará la Aplicación, O\n\n(b) Tiene autorización explícita del propietario legal para acceder y modificar la unidad de infotainment.\n\nEl uso no autorizado de la Aplicación en dispositivos de terceros sin permiso del propietario está estrictamente prohibido y puede violar leyes aplicables.',
      },
      {
        title: '4. Usos Prohibidos',
        content: 'Usted acepta NO utilizar la Aplicación para:\n\n(a) Acceder a dispositivos de terceros sin autorización explícita del propietario\n\n(b) Realizar intrusión remota, escaneo masivo o ataques a redes o dispositivos\n\n(c) Instalar malware, spyware o cargas útiles de control remoto\n\n(d) Recopilar credenciales, información de pago o datos personales sensibles no relacionados\n\n(e) Violar derechos de propiedad intelectual de terceros, términos de licencia o leyes aplicables\n\n(f) Distribuir medios con derechos de autor, mapas o servicios de suscripción pagados sin autorización\n\n(g) Modificar sistemas críticos de seguridad del vehículo (control del motor, control de emisiones, frenado, dirección, airbags)\n\n(h) Cualquier actividad ilegal, fraudulenta o dañina',
      },
      {
        title: '5. Riesgos y Advertencias',
        content: 'Usted reconoce y acepta que:\n\n(a) El uso de la Aplicación implica riesgos técnicos, incluida la posibilidad de daño al hardware de infotainment, pérdida de funcionalidad o invalidación de garantías del fabricante.\n\n(b) La emulación de identificador de adaptador ("spoofing") puede resultar en daño permanente al adaptador USB-Ethernet si se realiza incorrectamente.\n\n(c) La modificación de configuraciones de infotainment puede afectar el funcionamiento del sistema y puede requerir asistencia técnica profesional para revertir.\n\n(d) El desarrollador no se hace responsable de daños, pérdidas o consecuencias derivadas del uso de la Aplicación.',
      },
      {
        title: '6. Descargo de Responsabilidad y Limitación de Responsabilidad',
        content: 'LA APLICACIÓN SE PROPORCIONA "TAL CUAL" Y "SEGÚN DISPONIBILIDAD", SIN GARANTÍAS DE NINGÚN TIPO, EXPRESAS O IMPLÍCITAS, INCLUIDAS, ENTRE OTRAS, GARANTÍAS DE COMERCIABILIDAD, IDONEIDAD PARA UN PROPÓSITO PARTICULAR Y NO INFRACCIÓN.\n\nEN NINGÚN CASO EL DESARROLLADOR SERÁ RESPONSABLE DE DAÑOS DIRECTOS, INDIRECTOS, INCIDENTALES, ESPECIALES, CONSECUENTES O PUNITIVOS, INCLUIDOS, ENTRE OTROS, PÉRDIDA DE BENEFICIOS, DATOS, USO, FONDO DE COMERCIO U OTRAS PÉRDIDAS INTANGIBLES, RESULTANTES DE:\n\n(a) Su uso o incapacidad de usar la Aplicación\n\n(b) Cualquier acceso no autorizado o alteración de sus transmisiones o datos\n\n(c) Cualquier daño al hardware de infotainment, adaptadores USB o vehículo\n\n(d) Cualquier otra cuestión relacionada con la Aplicación',
      },
      {
        title: '7. Privacidad y Manejo de Datos',
        content: 'La Aplicación está diseñada para operar localmente con recopilación mínima de datos. La Aplicación NO recopila información personal, datos de ubicación, información de pago ni identificadores de publicidad. Los registros de diagnóstico se acceden localmente y solo se comparten fuera del dispositivo si usted elige explícitamente exportarlos o compartirlos (por ejemplo, con soporte técnico). Para más información, consulte nuestra Política de Privacidad en https://feplazas.github.io/mib2-controller/privacy-policy.html',
      },
      {
        title: '8. Cumplimiento Legal',
        content: 'Usted es responsable de cumplir con todas las leyes, regulaciones y términos de licencia aplicables en su jurisdicción. La Aplicación se proporciona con la intención de cumplir con las exenciones DMCA Sección 1201 (17 U.S.C. 1201) y principios de interoperabilidad (17 U.S.C. 1201(f)) en Estados Unidos, pero las exenciones no anulan automáticamente otras leyes, términos contractuales o políticas de plataforma. Usted acepta no utilizar la Aplicación de manera que viole los derechos de terceros o las leyes aplicables.',
      },
      {
        title: '9. Modificaciones a los Términos',
        content: 'El desarrollador se reserva el derecho de modificar estos Términos de Uso en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en la Aplicación o en el sitio web del desarrollador. Su uso continuado de la Aplicación después de dichas modificaciones constituye su aceptación de los nuevos términos.',
      },
      {
        title: '10. Terminación',
        content: 'El desarrollador se reserva el derecho de suspender o terminar su acceso a la Aplicación en cualquier momento, sin previo aviso, por cualquier motivo, incluido, entre otros, el incumplimiento de estos Términos de Uso.',
      },
      {
        title: '11. Ley Aplicable y Jurisdicción',
        content: 'Estos Términos de Uso se regirán e interpretarán de acuerdo con las leyes de Colombia, sin tener en cuenta sus disposiciones sobre conflictos de leyes. Cualquier disputa que surja de o en relación con estos términos estará sujeta a la jurisdicción exclusiva de los tribunales de Colombia.',
      },
      {
        title: '12. Contacto',
        content: 'Si tiene preguntas sobre estos Términos de Uso, puede contactarnos en:\n\nCorreo electrónico: [agregar correo de soporte]\nSitio web: https://github.com/feplazas/mib2-controller',
      },
    ],
  },
  en: {
    title: 'Terms of Use',
    lastUpdated: 'January 16, 2026',
    sections: [
      {
        title: '1. Acceptance of Terms',
        content: 'By downloading, installing, or using MIB2 Controller ("the Application"), you agree to be bound by these Terms of Use. If you do not agree to these terms, do not use the Application.',
      },
      {
        title: '2. Scope and Purpose of the Application',
        content: 'MIB2 Controller is a local, owner-authorized diagnostic and configuration tool for Volkswagen Group MIB2 STD2 infotainment units (Technisat/Preh variants). The Application is designed exclusively for use on user-owned infotainment hardware and requires physical access to the vehicle environment and a direct local connection path (e.g., USB-to-Ethernet adapter).',
      },
      {
        title: '3. Owner Authorization',
        content: 'You represent and warrant that:\n\n(a) You are the legal owner of the vehicle and infotainment unit on which you will use the Application, OR\n\n(b) You have explicit authorization from the legal owner to access and modify the infotainment unit.\n\nUnauthorized use of the Application on third-party devices without owner permission is strictly prohibited and may violate applicable laws.',
      },
      {
        title: '4. Prohibited Uses',
        content: 'You agree NOT to use the Application to:\n\n(a) Access third-party devices without explicit owner authorization\n\n(b) Perform remote intrusion, mass scanning, or attacks on networks or devices\n\n(c) Install malware, spyware, or remote-control payloads\n\n(d) Collect credentials, payment information, or unrelated sensitive personal data\n\n(e) Violate third-party intellectual property rights, licensing terms, or applicable laws\n\n(f) Distribute copyrighted media, maps, or paid subscription services without authorization\n\n(g) Modify vehicle safety-critical systems (engine control, emissions control, braking, steering, airbags)\n\n(h) Any illegal, fraudulent, or harmful activity',
      },
      {
        title: '5. Risks and Warnings',
        content: 'You acknowledge and agree that:\n\n(a) Use of the Application involves technical risks, including the possibility of damage to infotainment hardware, loss of functionality, or voiding of manufacturer warranties.\n\n(b) Adapter identifier emulation ("spoofing") may result in permanent damage to the USB-to-Ethernet adapter if performed incorrectly.\n\n(c) Modification of infotainment configurations may affect system operation and may require professional technical assistance to revert.\n\n(d) The developer is not responsible for damages, losses, or consequences arising from use of the Application.',
      },
      {
        title: '6. Disclaimer of Warranties and Limitation of Liability',
        content: 'THE APPLICATION IS PROVIDED "AS IS" AND "AS AVAILABLE", WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.\n\nIN NO EVENT SHALL THE DEVELOPER BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING, BUT NOT LIMITED TO, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:\n\n(a) Your use or inability to use the Application\n\n(b) Any unauthorized access to or alteration of your transmissions or data\n\n(c) Any damage to infotainment hardware, USB adapters, or vehicle\n\n(d) Any other matter relating to the Application',
      },
      {
        title: '7. Privacy and Data Handling',
        content: 'The Application is designed to operate locally with minimal data collection. The Application does NOT collect personal information, location data, payment information, or advertising identifiers. Diagnostic logs are accessed locally and are only shared off-device if you explicitly choose to export or share them (e.g., with technical support). For more information, see our Privacy Policy at https://feplazas.github.io/mib2-controller/privacy-policy.html',
      },
      {
        title: '8. Legal Compliance',
        content: 'You are responsible for complying with all applicable laws, regulations, and licensing terms in your jurisdiction. The Application is provided with the intent to comply with DMCA Section 1201 exemptions (17 U.S.C. 1201) and interoperability principles (17 U.S.C. 1201(f)) in the United States, but exemptions do not automatically override other laws, contractual terms, or platform policies. You agree not to use the Application in a manner that violates third-party rights or applicable laws.',
      },
      {
        title: '9. Modifications to Terms',
        content: 'The developer reserves the right to modify these Terms of Use at any time. Modifications will become effective immediately upon posting in the Application or on the developer\'s website. Your continued use of the Application after such modifications constitutes your acceptance of the new terms.',
      },
      {
        title: '10. Termination',
        content: 'The developer reserves the right to suspend or terminate your access to the Application at any time, without prior notice, for any reason, including, but not limited to, breach of these Terms of Use.',
      },
      {
        title: '11. Governing Law and Jurisdiction',
        content: 'These Terms of Use shall be governed by and construed in accordance with the laws of Colombia, without regard to its conflict of law provisions. Any dispute arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the courts of Colombia.',
      },
      {
        title: '12. Contact',
        content: 'If you have questions about these Terms of Use, you can contact us at:\n\nEmail: [add support email]\nWebsite: https://github.com/feplazas/mib2-controller',
      },
    ],
  },
  de: {
    title: 'Nutzungsbedingungen',
    lastUpdated: '16. Januar 2026',
    sections: [
      {
        title: '1. Annahme der Bedingungen',
        content: 'Durch das Herunterladen, Installieren oder Verwenden von MIB2 Controller ("die Anwendung") erklären Sie sich mit diesen Nutzungsbedingungen einverstanden. Wenn Sie mit diesen Bedingungen nicht einverstanden sind, verwenden Sie die Anwendung nicht.',
      },
      {
        title: '2. Umfang und Zweck der Anwendung',
        content: 'MIB2 Controller ist ein lokales, vom Eigentümer autorisiertes Diagnose- und Konfigurationswerkzeug für Volkswagen Group MIB2 STD2 Infotainment-Einheiten (Technisat/Preh-Varianten). Die Anwendung ist ausschließlich für die Verwendung auf Infotainment-Hardware im Besitz des Benutzers konzipiert und erfordert physischen Zugang zur Fahrzeugumgebung und einen direkten lokalen Verbindungspfad (z. B. USB-zu-Ethernet-Adapter).',
      },
      {
        title: '3. Eigentümerautorisierung',
        content: 'Sie versichern und garantieren, dass:\n\n(a) Sie der rechtmäßige Eigentümer des Fahrzeugs und der Infotainment-Einheit sind, auf der Sie die Anwendung verwenden werden, ODER\n\n(b) Sie eine ausdrückliche Genehmigung des rechtmäßigen Eigentümers haben, um auf die Infotainment-Einheit zuzugreifen und sie zu ändern.\n\nDie unbefugte Verwendung der Anwendung auf Geräten Dritter ohne Genehmigung des Eigentümers ist strengstens untersagt und kann gegen geltende Gesetze verstoßen.',
      },
      {
        title: '4. Verbotene Verwendungen',
        content: 'Sie stimmen zu, die Anwendung NICHT zu verwenden, um:\n\n(a) Auf Geräte Dritter ohne ausdrückliche Genehmigung des Eigentümers zuzugreifen\n\n(b) Remote-Einbrüche, Massen-Scans oder Angriffe auf Netzwerke oder Geräte durchzuführen\n\n(c) Malware, Spyware oder Fernsteuerungs-Payloads zu installieren\n\n(d) Anmeldeinformationen, Zahlungsinformationen oder nicht verwandte sensible persönliche Daten zu sammeln\n\n(e) Geistige Eigentumsrechte Dritter, Lizenzbedingungen oder geltende Gesetze zu verletzen\n\n(f) Urheberrechtlich geschützte Medien, Karten oder kostenpflichtige Abonnementdienste ohne Genehmigung zu verteilen\n\n(g) Sicherheitskritische Fahrzeugsysteme zu ändern (Motorsteuerung, Emissionskontrolle, Bremsen, Lenkung, Airbags)\n\n(h) Jegliche illegale, betrügerische oder schädliche Aktivität',
      },
      {
        title: '5. Risiken und Warnungen',
        content: 'Sie erkennen an und stimmen zu, dass:\n\n(a) Die Verwendung der Anwendung technische Risiken birgt, einschließlich der Möglichkeit von Schäden an der Infotainment-Hardware, Funktionsverlust oder Erlöschen der Herstellergarantien.\n\n(b) Die Adapter-Identifikations-Emulation ("Spoofing") kann zu dauerhaften Schäden am USB-zu-Ethernet-Adapter führen, wenn sie falsch durchgeführt wird.\n\n(c) Die Änderung von Infotainment-Konfigurationen kann den Systembetrieb beeinträchtigen und kann professionelle technische Unterstützung erfordern, um sie rückgängig zu machen.\n\n(d) Der Entwickler ist nicht verantwortlich für Schäden, Verluste oder Folgen, die sich aus der Verwendung der Anwendung ergeben.',
      },
      {
        title: '6. Gewährleistungsausschluss und Haftungsbeschränkung',
        content: 'DIE ANWENDUNG WIRD "WIE BESEHEN" UND "WIE VERFÜGBAR" BEREITGESTELLT, OHNE GEWÄHRLEISTUNGEN JEGLICHER ART, AUSDRÜCKLICH ODER STILLSCHWEIGEND, EINSCHLIESSLICH, ABER NICHT BESCHRÄNKT AUF GEWÄHRLEISTUNGEN DER MARKTGÄNGIGKEIT, EIGNUNG FÜR EINEN BESTIMMTEN ZWECK UND NICHTVERLETZUNG.\n\nIN KEINEM FALL HAFTET DER ENTWICKLER FÜR DIREKTE, INDIREKTE, ZUFÄLLIGE, BESONDERE, FOLGE- ODER STRAFSCHÄDEN, EINSCHLIESSLICH, ABER NICHT BESCHRÄNKT AUF VERLUST VON GEWINNEN, DATEN, NUTZUNG, GOODWILL ODER ANDEREN IMMATERIELLEN VERLUSTEN, DIE SICH ERGEBEN AUS:\n\n(a) Ihrer Verwendung oder Unfähigkeit, die Anwendung zu verwenden\n\n(b) Jedem unbefugten Zugriff auf oder Änderung Ihrer Übertragungen oder Daten\n\n(c) Jedem Schaden an Infotainment-Hardware, USB-Adaptern oder Fahrzeug\n\n(d) Jeder anderen Angelegenheit im Zusammenhang mit der Anwendung',
      },
      {
        title: '7. Datenschutz und Datenverarbeitung',
        content: 'Die Anwendung ist so konzipiert, dass sie lokal mit minimaler Datenerfassung arbeitet. Die Anwendung erfasst KEINE persönlichen Informationen, Standortdaten, Zahlungsinformationen oder Werbe-IDs. Diagnoseprotokolle werden lokal abgerufen und werden nur dann außerhalb des Geräts geteilt, wenn Sie sich ausdrücklich dafür entscheiden, sie zu exportieren oder zu teilen (z. B. mit technischem Support). Weitere Informationen finden Sie in unserer Datenschutzrichtlinie unter https://feplazas.github.io/mib2-controller/privacy-policy.html',
      },
      {
        title: '8. Rechtliche Einhaltung',
        content: 'Sie sind dafür verantwortlich, alle geltenden Gesetze, Vorschriften und Lizenzbedingungen in Ihrer Gerichtsbarkeit einzuhalten. Die Anwendung wird mit der Absicht bereitgestellt, die DMCA Section 1201-Ausnahmen (17 U.S.C. 1201) und Interoperabilitätsprinzipien (17 U.S.C. 1201(f)) in den Vereinigten Staaten einzuhalten, aber Ausnahmen setzen nicht automatisch andere Gesetze, vertragliche Bedingungen oder Plattformrichtlinien außer Kraft. Sie stimmen zu, die Anwendung nicht in einer Weise zu verwenden, die gegen die Rechte Dritter oder geltende Gesetze verstößt.',
      },
      {
        title: '9. Änderungen der Bedingungen',
        content: 'Der Entwickler behält sich das Recht vor, diese Nutzungsbedingungen jederzeit zu ändern. Änderungen werden sofort nach der Veröffentlichung in der Anwendung oder auf der Website des Entwicklers wirksam. Ihre fortgesetzte Nutzung der Anwendung nach solchen Änderungen stellt Ihre Annahme der neuen Bedingungen dar.',
      },
      {
        title: '10. Beendigung',
        content: 'Der Entwickler behält sich das Recht vor, Ihren Zugang zur Anwendung jederzeit, ohne vorherige Ankündigung, aus beliebigem Grund auszusetzen oder zu beenden, einschließlich, aber nicht beschränkt auf Verstöße gegen diese Nutzungsbedingungen.',
      },
      {
        title: '11. Anwendbares Recht und Gerichtsstand',
        content: 'Diese Nutzungsbedingungen unterliegen den Gesetzen Kolumbiens und werden nach diesen ausgelegt, ohne Rücksicht auf seine Kollisionsnormen. Jede Streitigkeit, die sich aus oder im Zusammenhang mit diesen Bedingungen ergibt, unterliegt der ausschließlichen Zuständigkeit der Gerichte Kolumbiens.',
      },
      {
        title: '12. Kontakt',
        content: 'Wenn Sie Fragen zu diesen Nutzungsbedingungen haben, können Sie uns kontaktieren unter:\n\nE-Mail: [Support-E-Mail hinzufügen]\nWebsite: https://github.com/feplazas/mib2-controller',
      },
    ],
  },
};
