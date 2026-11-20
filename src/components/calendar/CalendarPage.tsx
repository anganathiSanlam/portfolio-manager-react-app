import Tabs from "../common/tabs/Tabs";
import { useActiveTab } from "../common/tabs/useActiveTab";
import Calendar from "./Calendar";
import Notes from "../notes/Notes";

const TABS = [
  { id: "calendar", label: "Calendar" },
  { id: "notes",    label: "Notes" },
];

export default function CalendarPage() {
  const tab = useActiveTab("calendar", "calendar");

  return (
    <div>
      <Tabs page="calendar" tabs={TABS} />
      {tab === "calendar" && <Calendar />}
      {tab === "notes"    && <Notes />}
    </div>
  );
}
