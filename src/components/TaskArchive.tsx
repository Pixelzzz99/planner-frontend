export function TaskArchive({ archivedTasks }) {
  return (
    <div className="border p-3 rounded-md mb-4">
      <h2 className="font-semibold mb-2 text-lg">Архив задач</h2>
      {archivedTasks.length === 0 && (
        <div className="text-gray-500 text-sm">Архив пуст</div>
      )}
      {archivedTasks.map((task) => (
        <div key={task.id} className="p-2 mb-2 bg-gray-100 rounded-md text-sm">
          <div className="font-semibold">{task.title}</div>
          <div className="text-xs text-gray-600">{task.description}</div>
          <div className="text-xs mt-1">
            Статус: {task.done ? "Сделано" : "Не сделано"}
          </div>
        </div>
      ))}
    </div>
  );
}
