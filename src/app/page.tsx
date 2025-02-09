import { useEffect, useState } from "react";
import { useAuthStore } from "@/entities/user/auth";
import { api } from "@/shared/api/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  const [tasks, setTasks] = useState([]);
  const { logout } = useAuthStore();

  useEffect(() => {
    api
      .get("/tasks/1")
      .then((response) => {
        setTasks(response.data);
      })
      .catch((err) => {
        console.error(err);
      });
  });

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-3xl font-bold">Задачи</h1>
        <Button onClick={logout}>Выйти</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <Card key={task.id} className="p-4">
            <h3 className="text-lg font-semibold">{task.title}</h3>
            <p>Приоритет: {task.priority}</p>
            <p>Статус: {task.status}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
