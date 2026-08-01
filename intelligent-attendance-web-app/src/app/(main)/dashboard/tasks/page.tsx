import { tasks } from "./_components/data";
import { Tasks } from "./_components/tasks";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-3xl tracking-tight">Chào mừng trở lại!</h2>
        <p className="text-muted-foreground">Dưới đây là danh sách công việc của bạn trong tháng này!</p>
      </div>
      <Tasks data={tasks} />
    </div>
  );
}
