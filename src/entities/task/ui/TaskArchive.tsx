export function TaskArchive({ archivedTasks }) {
  return (
    <div className="border border-border p-3 rounded-md mb-4 bg-card">
      <h2 className="font-semibold mb-2 text-lg text-foreground">
        Архив задач
      </h2>
      {archivedTasks.length === 0 && (
        <div className="text-muted-foreground text-sm">Архив пуст</div>
      )}
      {archivedTasks.map((task) => (
        <div
          key={task.id}
          className="p-2 mb-2 bg-muted rounded-md text-sm hover:bg-muted/80 transition-colors"
        >
          <div className="font-semibold text-foreground">{task.title}</div>
          <div className="text-xs text-muted-foreground">
            {task.description}
          </div>
          <div className="text-xs mt-1 text-muted-foreground flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                task.done ? "bg-green-500" : "bg-yellow-500"
              }`}
            />
            Статус: {task.done ? "Сделано" : "Не сделано"}
          </div>
        </div>
      ))}
    </div>
  );
}
