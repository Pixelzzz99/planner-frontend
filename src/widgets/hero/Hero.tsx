import { Button } from "@/components/ui/button";
import Link from "next/link";

export const Hero = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 text-center">
      <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
        Планируйте свой путь к успеху
      </h1>
      <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
        Организуйте свои цели, задачи и время с помощью нашего умного
        планировщика
      </p>
      <div className="space-x-4">
        <Link href="/dashboard/year">
          <Button size="lg" className="h-11 px-8 text-lg">
            Начать работу
          </Button>
        </Link>
      </div>
    </div>
  );
};
