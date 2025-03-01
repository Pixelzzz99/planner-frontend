import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const UserStats = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Всего задач
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">24</div>
          <p className="text-xs text-muted-foreground">
            +20% с прошлого месяца
          </p>
        </CardContent>
      </Card>
      <Card className="bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Выполнено задач
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">18</div>
          <p className="text-xs text-muted-foreground">78% эффективность</p>
        </CardContent>
      </Card>
      <Card className="bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Активные цели
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">5</div>
          <p className="text-xs text-muted-foreground">3 долгосрочных</p>
        </CardContent>
      </Card>
      <Card className="bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Продуктивность
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">85%</div>
          <p className="text-xs text-muted-foreground">+12% к прошлой неделе</p>
        </CardContent>
      </Card>
    </div>
  );
};
