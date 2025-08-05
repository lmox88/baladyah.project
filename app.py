
from flask import Flask, request, redirect, render_template
from flask import Flask, request, redirect, render_template, send_from_directory
from flask import jsonify
from datetime import datetime

import pandas as pd
import sqlite3
import os


app = Flask(__name__, static_folder='static')
UPLOAD_FOLDER = 'uploads'
DB_NAME = 'database.db'



os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def init_db():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS conversions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_name TEXT,
        department TEXT,
        sub_department TEXT,
        conversion_number TEXT,
        conversion_title TEXT,
        conversion_status TEXT,
        conversion_type TEXT,
        creation_date TEXT
    )''')
    conn.commit()
    conn.close()

@app.route('/')
def home():
    return 'Welcome to Baladyah Project API'

@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        if 'file' not in request.files:
            return 'No file part'
        file = request.files['file']
        if file.filename == '':
            return 'No selected file'
        filepath = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(filepath)

        # قراءة الاكسل وتحويله لقاعدة بيانات
        df = pd.read_excel(filepath)
        print("أسماء الأعمدة الموجودة:", df.columns.tolist())

        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        c.execute('DELETE FROM conversions')  # نمسح البيانات القديمة
        conn.commit()

        for _, row in df.iterrows():
            c.execute('''
                INSERT INTO conversions (
                    employee_name, department, sub_department,
                    conversion_number, conversion_title, conversion_status,
                    conversion_type, creation_date
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                row['إسم_الموظف'], row['الإدارة'], row['الإدارة_الفرعية'],
                str(row['رقم_التحويلة']), row['مسمى_التحويلة'], row['حالة_التحويلة'],
                row['نوع_التحويلة'], str(row['تاريخ_الإنشاء'])
            ))
            
        conn.commit()
        conn.close()
        
        return 'File uploaded and database updated successfully'

    return '''
    <h1>Upload Excel File</h1>
    <form method="post" enctype="multipart/form-data">
      <input type="file" name="file" accept=".xlsx"/>
      <input type="submit" value="Upload"/>
    </form>
    '''

@app.route('/api/conversions')
def get_conversions():
    number = request.args.get('number', '')
    title = request.args.get('title', '')
    department = request.args.get('department', '')
    sub_department = request.args.get('sub_department', '')
    employee_name = request.args.get('employee_name', '')

    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    query = "SELECT * FROM conversions WHERE 1=1"
    params = []

    if number:
        query += " AND conversion_number LIKE ?"
        params.append(f"%{number}%")
    if title:
        query += " AND conversion_title LIKE ?"
        params.append(f"%{title}%")
    if department:
        query += " AND department = ?"
        params.append(department)
    if sub_department:
        query += " AND sub_department = ?"
        params.append(sub_department)
    if employee_name:
        query += " AND employee_name = ?"
        params.append(employee_name)

    c.execute(query, params)
    rows = c.fetchall()
    results = [dict(row) for row in rows]

    return jsonify({'conversions': results})

@app.route('/admin/api/conversions')
def get_admin_conversions():
    number = request.args.get('number', '')
    title = request.args.get('title', '')
    department = request.args.get('department', '')
    sub_department = request.args.get('sub_department', '')
    employee_name = request.args.get('employee_name', '')

    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    query = "SELECT * FROM conversions WHERE 1=1"
    params = []

    if number:
        query += " AND conversion_number LIKE ?"
        params.append(f"%{number}%")
    if title:
        query += " AND conversion_title LIKE ?"
        params.append(f"%{title}%")
    if department:
        query += " AND department = ?"
        params.append(department)
    if sub_department:
        query += " AND sub_department = ?"
        params.append(sub_department)
    if employee_name:
        query += " AND employee_name = ?"
        params.append(employee_name)

    c.execute(query, params)
    rows = c.fetchall()
    results = [dict(row) for row in rows]

    return jsonify({'conversions': results})


@app.route('/user')
def user_page():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    rows = c.execute('SELECT * FROM conversions').fetchall()
    conn.close()
    return render_template('user.html', conversions=rows)

@app.route('/api/filters')
def get_filter_options():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute('SELECT DISTINCT department FROM conversions')
    departments = [row[0] for row in c.fetchall()]
    c.execute('SELECT DISTINCT sub_department FROM conversions')
    sub_departments = [row[0] for row in c.fetchall()]
    c.execute('SELECT DISTINCT employee_name FROM conversions')
    employees = [row[0] for row in c.fetchall()]
    conn.close()

    return jsonify({
        'department': departments,
        'sub_department': sub_departments,
        'employee_name': employees
    })
@app.route('/admin')
def admin_page():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    rows = c.execute('SELECT * FROM conversions').fetchall()
    conn.close()
    return render_template('admin.html', conversions=rows)


@app.route('/admin/api/filters')
def get_admin_filter_options():
    conn = sqlite3.connect('database.db')
    c = conn.cursor()

    c.execute('SELECT DISTINCT department FROM conversions')
    departments = [row[0] for row in c.fetchall() if row[0]]

    c.execute('SELECT DISTINCT sub_department FROM conversions')
    sub_departments = [row[0] for row in c.fetchall() if row[0]]

    c.execute('SELECT DISTINCT employee_name FROM conversions')
    employees = [row[0] for row in c.fetchall() if row[0]]

    conn.close()

    return jsonify({
        'department': departments,
        'sub_department': sub_departments,
        'employee_name': employees
    })

@app.route('/api/delete', methods=['POST'])
def delete_conversions():
    data = request.json
    numbers = data.get('conversion_numbers', [])

    if not numbers:
        return jsonify({'success': False, 'message': 'لا توجد تحويلات محددة'}), 400

    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()

    try:
        for number in numbers:
            c.execute('DELETE FROM conversions WHERE conversion_number = ?', (number,))
            # تأكد أن جدول logs موجود وإذا ما تستخدمه احذف هذا السطر أو أنشئ جدول logs
            c.execute('INSERT INTO logs (action_type, conversion_number, timestamp) VALUES (?, ?, ?)', 
                      ('delete', number, datetime.now().isoformat()))

        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({'success': False, 'message': f'حدث خطأ: {e}'}), 500
    finally:
        conn.close()

    return jsonify({'success': True})
@app.route('/api/logs')
def get_logs():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute('''
        SELECT action_type, conversion_number 
        FROM logs 
        ORDER BY timestamp DESC 
        LIMIT 3
    ''')
    rows = c.fetchall()
    conn.close()

    return jsonify([
        {'action': row[0], 'number': row[1]} for row in rows
    ])

@app.route('/add')
def add_page():
    return render_template('add.html')
@app.route('/api/add_transfer', methods=['POST'])
def add_transfer():
    number = request.form.get('transfer_number')
    name = request.form.get('transfer_name')
    department = request.form.get('department')
    sub_department = request.form.get('sub_department')
    employee_name = request.form.get('employee_name')
    status = request.form.get('status')or 'نشطة'          # الحالة الافتراضية
    transfer_type = request.form.get('type')or 'عامة'     # النوع الافتراضي
    is_edit = request.form.get('is_edit') == 'true'

    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()

    try:
        if number:
            # التحقق من وجود التحويلة
            c.execute("SELECT 1 FROM conversions WHERE conversion_number = ?", (number,))
            exists = c.fetchone()

            if exists:
                if is_edit:
                    # تعديل — لازم الرقم موجود عشان يعدل
                    c.execute("SELECT 1 FROM conversions WHERE conversion_number = ?", (number,))
                    if not c.fetchone():
                        return jsonify({"success": False, "message": "⚠️ لا يمكن تعديل تحويلة غير موجودة."}), 400

                    c.execute("""
                        UPDATE conversions
                        SET
                            conversion_title = ?,
                            department = ?,
                            sub_department = ?,
                            employee_name = ?,
                            conversion_status = ?,
                            conversion_type = ?,
                            creation_date = DATE('now')
                        WHERE conversion_number = ?
                    """, (
                        name, department, sub_department,
                        employee_name, status, transfer_type, number
                    ))
                    c.execute('INSERT INTO logs (action_type, conversion_number, timestamp) VALUES (?, ?, ?)',
                              ('edit', number, datetime.now().isoformat()))
                else:
                    return jsonify({"success": False, "message": "⚠️ يوجد تحويلة بهذا الرقم بالفعل. لا يمكن إضافتها مجددًا."}), 400
            else:
                # إضافة جديدة
                c.execute("""
                    INSERT INTO conversions (
                        conversion_number, conversion_title, department, sub_department,
                        employee_name, conversion_status, conversion_type, creation_date
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, DATE('now'))
                """, (
                    number, name, department, sub_department,
                    employee_name, status, transfer_type
                ))
                c.execute('INSERT INTO logs (action_type, conversion_number, timestamp) VALUES (?, ?, ?)',
                          ('create', number, datetime.now().isoformat()))

        # رفع ملف إذا موجود
        file = request.files.get('file')
        if file:
            ext = file.filename.split('.')[-1].lower()
            df = pd.read_excel(file) if ext in ['xlsx', 'xls'] else pd.read_csv(file)

            for _, row in df.iterrows():
                conv_number = str(row['رقم_التحويلة'])

                c.execute("SELECT 1 FROM conversions WHERE conversion_number = ?", (conv_number,))
                if c.fetchone():
                    # تجاهل التحويلة المكررة
                    continue
                else:
                    # تحويلة جديدة
                    c.execute("""
                        INSERT INTO conversions (
                            employee_name, department, sub_department,
                            conversion_number, conversion_title, conversion_status,
                            conversion_type, creation_date
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        row['إسم_الموظف'], row['الإدارة'], row['الإدارة_الفرعية'],
                        conv_number, row['مسمى_التحويلة'], row['حالة_التحويلة'],
                        row['نوع_التحويلة'], str(row['تاريخ_الإنشاء'])
                    ))
                    c.execute('INSERT INTO logs (action_type, conversion_number, timestamp) VALUES (?, ?, ?)',
                              ('create', conv_number, datetime.now().isoformat()))

        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": f"حدث خطأ: {e}"}), 500
    finally:
        conn.close()

    return jsonify({"success": True, "message": "✅ تمت الإضافة أو التحديث بنجاح"}), 200

@app.route('/index')
def home_page():
    return render_template('index.html')


if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))

