import sqlite3
import datetime

paths = [
    "C:\\HermesPortable\\home\\spaces\\tirol-tourismus\\kanban\\boards\\tirol-cicd\\kanban.db",
    "C:\\HermesPortable\\home\\kanban\\boards\\tirol-cicd\\kanban.db",
]

for p in paths:
    conn = sqlite3.connect(p)
    now = datetime.datetime.now().timestamp()
    
    # Check schema first — does 'updated_at' column exist?
    cols = [col[1] for col in conn.execute("PRAGMA table_info(tasks)").fetchall()]
    
    if 'updated_at' in cols:
        conn.execute("UPDATE tasks SET status='done', updated_at=? WHERE id='t_nl_gastro_finish'", (now,))
    else:
        conn.execute("UPDATE tasks SET status='done' WHERE id='t_nl_gastro_finish'")
    
    # Verify
    row = conn.execute("SELECT id, status FROM tasks WHERE id='t_nl_gastro_finish'").fetchone()
    print(f"{p}: {row}")
    
    conn.commit()
    conn.close()
