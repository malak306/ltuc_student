/**
 * LTUC Employee Management System - Logic
 */

class EmployeeManager {
    constructor() {
        this.employees = JSON.parse(localStorage.getItem('ltuc_employees')) || [];
        this.form = document.getElementById('employee-form');
        this.listContainer = document.getElementById('employee-list');
        this.emptyState = document.getElementById('empty-state');
        this.submitBtn = document.getElementById('submit-btn');
        this.cancelBtn = document.getElementById('cancel-btn');
        this.editIndexInput = document.getElementById('edit-index');
        this.formTitle = document.getElementById('form-title');
        this.searchInput = document.getElementById('search-input');
        this.toast = document.getElementById('toast');

        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.cancelBtn.addEventListener('click', () => this.resetForm());
        this.searchInput.addEventListener('input', () => this.renderEmployees());

        // Add action buttons to the UI dynamically if they don't exist
        this.addExtraActions();

        this.renderEmployees();
    }

    addExtraActions() {
        const tableHeader = document.querySelector('.table-header');
        if (!tableHeader) return;

        const actionGroup = document.createElement('div');
        actionGroup.className = 'extra-actions';
        actionGroup.style.display = 'flex';
        actionGroup.style.gap = '0.5rem';

        const seedBtn = document.createElement('button');
        seedBtn.className = 'btn-small secondary';
        seedBtn.innerHTML = '<span>🌱</span> Seed';
        seedBtn.onclick = () => this.seedData();
        seedBtn.title = "Populate with sample data";

        const exportBtn = document.createElement('button');
        exportBtn.className = 'btn-small secondary';
        exportBtn.innerHTML = '<span>📥</span> Export CSV';
        exportBtn.onclick = () => this.exportCSV();
        exportBtn.title = "Download as CSV";

        const clearBtn = document.createElement('button');
        clearBtn.className = 'btn-small danger-outline';
        clearBtn.innerHTML = '<span>🗑️</span> Clear All';
        clearBtn.onclick = () => this.clearAll();

        actionGroup.appendChild(seedBtn);
        actionGroup.appendChild(exportBtn);
        actionGroup.appendChild(clearBtn);

        tableHeader.appendChild(actionGroup);
    }

    saveToStorage() {
        localStorage.setItem('ltuc_employees', JSON.stringify(this.employees));
    }

    handleSubmit(e) {
        e.preventDefault();

        const employee = {
            id: document.getElementById('emp-id').value.trim(),
            name: document.getElementById('emp-name').value.trim(),
            age: document.getElementById('emp-age').value,
            address: document.getElementById('emp-address').value.trim()
        };

        const editIndex = this.editIndexInput.value;

        if (editIndex !== "") {
            // Update existing
            this.employees[editIndex] = employee;
            this.showToast('Employee updated successfully!');
        } else {
            // Check for duplicate ID
            if (this.employees.some(emp => emp.id === employee.id)) {
                alert('An employee with this ID already exists!');
                return;
            }
            // Add new
            this.employees.push(employee);
            this.showToast('Employee added successfully!');
        }

        this.saveToStorage();
        this.renderEmployees();
        this.resetForm();
    }

    renderEmployees() {
        const searchTerm = this.searchInput.value.toLowerCase();
        const filtered = this.employees.filter(emp =>
            emp.name.toLowerCase().includes(searchTerm) ||
            emp.id.includes(searchTerm) ||
            emp.address.toLowerCase().includes(searchTerm)
        );

        this.listContainer.innerHTML = '';

        if (filtered.length === 0) {
            this.emptyState.classList.remove('hidden');
        } else {
            this.emptyState.classList.add('hidden');
            filtered.forEach((emp, actualIndex) => {
                // Find the original index for editing/deleting
                const originalIndex = this.employees.indexOf(emp);

                const tr = document.createElement('tr');
                tr.style.animation = `fade-in 0.3s ease forwards ${actualIndex * 0.05}s`;
                tr.innerHTML = `
                    <td><code>${this.escapeHTML(emp.id)}</code></td>
                    <td><strong>${this.escapeHTML(emp.name)}</strong></td>
                    <td>${this.escapeHTML(emp.age)}</td>
                    <td>${this.escapeHTML(emp.address)}</td>
                    <td class="action-btns">
                        <button class="btn-icon btn-edit" onclick="manager.editEmployee(${originalIndex})" title="Edit">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="btn-icon btn-delete" onclick="manager.deleteEmployee(${originalIndex})" title="Delete">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                    </td>
                `;
                this.listContainer.appendChild(tr);
            });
        }
    }

    editEmployee(index) {
        const emp = this.employees[index];
        document.getElementById('emp-id').value = emp.id;
        document.getElementById('emp-name').value = emp.name;
        document.getElementById('emp-age').value = emp.age;
        document.getElementById('emp-address').value = emp.address;

        this.editIndexInput.value = index;
        this.formTitle.innerText = "Edit Employee";
        this.submitBtn.innerText = "Update Employee";
        this.cancelBtn.classList.remove('hidden');

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    deleteEmployee(index) {
        if (confirm('Are you sure you want to delete this employee?')) {
            this.employees.splice(index, 1);
            this.saveToStorage();
            this.renderEmployees();
            this.showToast('Employee deleted successfully!');
        }
    }

    clearAll() {
        if (confirm('CRITICAL: Delete ALL employee data? This cannot be undone.')) {
            this.employees = [];
            this.saveToStorage();
            this.renderEmployees();
            this.showToast('All data cleared.');
        }
    }

    seedData() {
        const sampleData = [
            { id: "1001", name: "Ahmad Suleiman", age: 34, address: "Amman, Jordan" },
            { id: "1002", name: "Lina Haddad", age: 28, address: "Irbid, Jordan" },
            { id: "1003", name: "Omar Qasem", age: 41, address: "Aqaba, Jordan" },
            { id: "1004", name: "Zaid Abbas", age: 25, address: "Zarqa, Jordan" }
        ];

        // Only add if not already there to prevent duplicates
        let added = 0;
        sampleData.forEach(sample => {
            if (!this.employees.some(e => e.id === sample.id)) {
                this.employees.push(sample);
                added++;
            }
        });

        if (added > 0) {
            this.saveToStorage();
            this.renderEmployees();
            this.showToast(`Seeded ${added} employees!`);
        } else {
            this.showToast('Sample data already exists.');
        }
    }

    exportCSV() {
        if (this.employees.length === 0) {
            alert('No data to export!');
            return;
        }

        const headers = ["ID", "Name", "Age", "Address"];
        const csvContent = [
            headers.join(','),
            ...this.employees.map(e => [e.id, `"${e.name}"`, e.age, `"${e.address}"`].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        link.setAttribute("href", url);
        link.setAttribute("download", `ltuc_employees_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showToast('CSV Exported!');
    }

    resetForm() {
        this.form.reset();
        this.editIndexInput.value = "";
        this.formTitle.innerText = "Add New Employee";
        this.submitBtn.innerText = "Save Employee";
        this.cancelBtn.classList.add('hidden');
    }

    showToast(message) {
        this.toast.innerText = message;
        this.toast.classList.add('show');
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }

    escapeHTML(str) {
        const p = document.createElement('p');
        p.textContent = str;
        return p.innerHTML;
    }
}

// Global instance for onclick access
const manager = new EmployeeManager();

// CSS Animation (added dynamically)
const style = document.createElement('style');
style.textContent = `
    @keyframes fade-in {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .btn-small {
        padding: 0.4rem 0.8rem;
        font-size: 0.8rem;
        border-radius: 8px;
        border: 1px solid var(--glass-border);
        background: rgba(255,255,255,0.05);
        color: var(--text-muted);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.4rem;
        transition: all 0.2s;
    }
    .btn-small:hover {
        background: rgba(255,255,255,0.1);
        color: white;
    }
    .btn-small.danger-outline:hover {
        background: rgba(239, 68, 68, 0.1);
        color: var(--danger);
        border-color: var(--danger);
    }
    code {
        background: rgba(255,255,255,0.1);
        padding: 0.2rem 0.4rem;
        border-radius: 4px;
        font-family: monospace;
    }
`;
document.head.appendChild(style);
