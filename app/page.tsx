import MedicalFeesForm from "@/components/medical-fees-form";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="container mx-auto p-4">
      <MedicalFeesForm />
      <div className="container mx-auto px-4 py-4 gap-4 flex flex-col">
        <div className="flex flex-row items-center gap-2">
          <Image
            src="/dattra-icon.png"
            alt="Logo da Dattra"
            width={30}
            height={50}
          />
          <p className="text-sm text-muted-foreground">
            © 2025 Todos os direitos reservados Mariana Alcantara
          </p>
        </div>
          <div className="flex flex-row items-center gap-2">
            <Image
              src="/ark-digital-logo-black.png"
              alt="Logo da Dattra"
              width={30}
              height={50}
            />
            <p className="text-sm text-muted-foreground">
              Desenvolvido por ArkDigital
            </p>
          </div>
      </div>
    </div>
  );
}
