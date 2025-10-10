#!/usr/bin/env python3
"""
Local Visual Score Updater for Checklist Detail Sheet
Run this locally to visually update scores in your Google Sheets
"""

import os
import json
import csv
from datetime import datetime
from typing import Dict, List, Optional
import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import threading

try:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
    GOOGLE_SHEETS_AVAILABLE = True
except ImportError:
    GOOGLE_SHEETS_AVAILABLE = False
    print("Google Sheets API not available. Install with: pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client")

class LocalScoreUpdater:
    def __init__(self):
        self.spreadsheet_id = '1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM'
        self.service = None
        self.stakeholders_data = []
        self.current_sheet = 'Checklist Detail'
        
        # Category configuration
        self.categories = {
            'Social Media': {
                'start_col': 'F',
                'end_col': 'O', 
                'total_col': 'P',
                'criteria': [
                    'Has business profile on Facebook',
                    'Has business profile on Instagram',
                    'Posts regularly (weekly+)',
                    'Uses business features (hours, contact)',
                    'Has customer reviews/ratings',
                    'Cross-promotes on multiple platforms',
                    'Uses hashtags strategically',
                    'Engages with customers in comments',
                    'Shares behind-the-scenes content',
                    'Has professional profile photos'
                ]
            },
            'Website': {
                'start_col': 'Q',
                'end_col': 'Z',
                'total_col': 'AA',
                'criteria': [
                    'Website loads and functions properly',
                    'Contact information clearly displayed',
                    'Services/products clearly described',
                    'Mobile-friendly design',
                    'Recent updates (within 6 months)',
                    'Professional design and layout',
                    'Fast loading speed',
                    'Clear navigation structure',
                    'Social media links included',
                    'Appears in Google search results'
                ]
            },
            'Visual Content': {
                'start_col': 'AB',
                'end_col': 'AK',
                'total_col': 'AL',
                'criteria': [
                    'High-quality photos (clear, well-lit)',
                    'Consistent visual style/branding',
                    'Professional product shots',
                    'Good composition and framing',
                    'Variety of content types',
                    'Regular content updates',
                    'Professional editing/retouching',
                    'Brand-consistent color scheme',
                    'High-quality video content',
                    'Visual content drives engagement'
                ]
            },
            'Discoverability': {
                'start_col': 'AM',
                'end_col': 'AV',
                'total_col': 'AW',
                'criteria': [
                    'Appears in Google search for business name',
                    'Has Google My Business listing',
                    'Listed in relevant directories',
                    'Has customer reviews online',
                    'Appears in local search results',
                    'Other websites link to them',
                    'Active on multiple platforms',
                    'Consistent business information',
                    'Regular online updates',
                    'Strong online reputation'
                ]
            },
            'Digital Sales': {
                'start_col': 'AX',
                'end_col': 'BG',
                'total_col': 'BH',
                'criteria': [
                    'Can receive inquiries online',
                    'Has contact forms that work',
                    'Accepts online payments',
                    'Has booking/reservation system',
                    'Uses WhatsApp for business',
                    'Has e-commerce capabilities',
                    'Digital payment integration',
                    'Online ordering system',
                    'Automated confirmation system',
                    'Customer service via digital channels'
                ]
            },
            'Platform Integration': {
                'start_col': 'BI',
                'end_col': 'BR',
                'total_col': 'BS',
                'criteria': [
                    'Listed on TripAdvisor',
                    'Listed on VisitTheGambia',
                    'Active on tourism platforms',
                    'Optimized platform listings',
                    'Regular platform updates',
                    'Professional platform presence',
                    'Cross-platform consistency',
                    'Platform-specific content',
                    'Customer engagement on platforms',
                    'Platform analytics tracking'
                ]
            }
        }
        
        self.setup_google_sheets()
        self.create_gui()

    def setup_google_sheets(self):
        """Setup Google Sheets API connection"""
        if not GOOGLE_SHEETS_AVAILABLE:
            return
            
        # Try to find credentials file
        credentials_paths = [
            '/Users/alexjeffries/tourism-commons/tourism-development-d620c-5c9db9e21301.json',
            './tourism-development-d620c-5c9db9e21301.json',
            'tourism-development-d620c-5c9db9e21301.json'
        ]
        
        credentials_path = None
        for path in credentials_paths:
            if os.path.exists(path):
                credentials_path = path
                break
        
        if not credentials_path:
            print("Google Sheets credentials not found. You can still use the app with CSV import/export.")
            return
            
        try:
            credentials = service_account.Credentials.from_service_account_file(
                credentials_path,
                scopes=['https://www.googleapis.com/auth/spreadsheets']
            )
            self.service = build('sheets', 'v4', credentials=credentials)
            print("✅ Google Sheets API connected successfully!")
        except Exception as e:
            print(f"❌ Error connecting to Google Sheets: {e}")
            self.service = None

    def create_gui(self):
        """Create the main GUI"""
        self.root = tk.Tk()
        self.root.title("Visual Score Updater - Checklist Detail")
        self.root.geometry("1400x900")
        self.root.configure(bg='#f0f0f0')
        
        # Create main frame
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Configure grid weights
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=1)
        main_frame.rowconfigure(2, weight=1)
        
        # Header
        header_frame = ttk.Frame(main_frame)
        header_frame.grid(row=0, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 10))
        
        ttk.Label(header_frame, text="🎯 Visual Score Updater", 
                 font=('Arial', 16, 'bold')).grid(row=0, column=0, sticky=tk.W)
        ttk.Label(header_frame, text="Update scores for Checklist Detail sheet", 
                 font=('Arial', 10)).grid(row=1, column=0, sticky=tk.W)
        
        # Controls frame
        controls_frame = ttk.LabelFrame(main_frame, text="Controls", padding="10")
        controls_frame.grid(row=1, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 10))
        
        # Sheet selection
        ttk.Label(controls_frame, text="Sheet:").grid(row=0, column=0, sticky=tk.W, padx=(0, 5))
        self.sheet_var = tk.StringVar(value="Checklist Detail")
        sheet_combo = ttk.Combobox(controls_frame, textvariable=self.sheet_var, 
                                  values=["Checklist Detail", "CI Assessment", "TO Assessment"], 
                                  state="readonly", width=15)
        sheet_combo.grid(row=0, column=1, sticky=tk.W, padx=(0, 20))
        
        # Filter
        ttk.Label(controls_frame, text="Filter:").grid(row=0, column=2, sticky=tk.W, padx=(0, 5))
        self.filter_var = tk.StringVar()
        filter_entry = ttk.Entry(controls_frame, textvariable=self.filter_var, width=20)
        filter_entry.grid(row=0, column=3, sticky=tk.W, padx=(0, 20))
        filter_entry.bind('<KeyRelease>', self.filter_stakeholders)
        
        # Buttons
        ttk.Button(controls_frame, text="🔄 Load from Google Sheets", 
                  command=self.load_from_sheets).grid(row=0, column=4, padx=(0, 5))
        ttk.Button(controls_frame, text="📁 Import CSV", 
                  command=self.import_csv).grid(row=0, column=5, padx=(0, 5))
        ttk.Button(controls_frame, text="💾 Save to Google Sheets", 
                  command=self.save_to_sheets).grid(row=0, column=6, padx=(0, 5))
        ttk.Button(controls_frame, text="📊 Export CSV", 
                  command=self.export_csv).grid(row=0, column=7, padx=(0, 5))
        
        # Status label
        self.status_var = tk.StringVar(value="Ready")
        status_label = ttk.Label(controls_frame, textvariable=self.status_var, 
                                foreground='blue')
        status_label.grid(row=1, column=0, columnspan=8, sticky=tk.W, pady=(10, 0))
        
        # Main content frame with scrollbar
        content_frame = ttk.Frame(main_frame)
        content_frame.grid(row=2, column=0, columnspan=2, sticky=(tk.W, tk.E, tk.N, tk.S))
        content_frame.columnconfigure(0, weight=1)
        content_frame.rowconfigure(0, weight=1)
        
        # Create canvas and scrollbar
        canvas = tk.Canvas(content_frame, bg='white')
        scrollbar = ttk.Scrollbar(content_frame, orient="vertical", command=canvas.yview)
        scrollable_frame = ttk.Frame(canvas)
        
        scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )
        
        canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)
        
        canvas.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        scrollbar.grid(row=0, column=1, sticky=(tk.N, tk.S))
        
        # Bind mousewheel to canvas
        def _on_mousewheel(event):
            canvas.yview_scroll(int(-1*(event.delta/120)), "units")
        canvas.bind_all("<MouseWheel>", _on_mousewheel)
        
        self.scrollable_frame = scrollable_frame
        self.canvas = canvas
        
        # Load initial data
        self.load_sample_data()

    def load_sample_data(self):
        """Load sample data for demonstration"""
        self.stakeholders_data = [
            {
                'name': 'Gambia Cultural Center',
                'sector': 'Cultural heritage sites/museums',
                'region': 'Greater Banjul Area',
                'row': 2,
                'scores': {
                    'Social Media': [1, 1, 0, 1, 0, 0, 0, 0, 0, 0],
                    'Website': [1, 1, 1, 0, 1, 0, 0, 0, 0, 0],
                    'Visual Content': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    'Discoverability': [1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
                    'Digital Sales': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    'Platform Integration': [1, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                }
            },
            {
                'name': 'Banjul Art Gallery',
                'sector': 'Performing and visual arts',
                'region': 'Greater Banjul Area',
                'row': 3,
                'scores': {
                    'Social Media': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                    'Website': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                    'Visual Content': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                    'Discoverability': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                    'Digital Sales': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                    'Platform Integration': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
                }
            },
            {
                'name': 'Serekunda Market Crafts',
                'sector': 'Crafts and artisan products',
                'region': 'West Coast Region',
                'row': 4,
                'scores': {
                    'Social Media': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    'Website': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    'Visual Content': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    'Discoverability': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    'Digital Sales': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    'Platform Integration': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                }
            }
        ]
        self.render_stakeholders()

    def load_from_sheets(self):
        """Load data from Google Sheets"""
        if not self.service:
            messagebox.showerror("Error", "Google Sheets API not available. Please check your credentials.")
            return
            
        def load_thread():
            try:
                self.status_var.set("Loading from Google Sheets...")
                self.root.update()
                
                # Get stakeholder names and basic info
                range_name = f"{self.current_sheet}!A2:E1000"
                result = self.service.spreadsheets().values().get(
                    spreadsheetId=self.spreadsheet_id,
                    range=range_name
                ).execute()
                
                values = result.get('values', [])
                self.stakeholders_data = []
                
                for i, row in enumerate(values, start=2):
                    if len(row) >= 3 and row[0].strip():
                        stakeholder = {
                            'name': row[0].strip(),
                            'sector': row[1] if len(row) > 1 else 'Unknown',
                            'region': row[2] if len(row) > 2 else 'Unknown',
                            'row': i,
                            'scores': {}
                        }
                        
                        # Load scores for each category
                        for category_name, category_config in self.categories.items():
                            try:
                                score_range = f"{self.current_sheet}!{category_config['start_col']}{i}:{category_config['end_col']}{i}"
                                score_result = self.service.spreadsheets().values().get(
                                    spreadsheetId=self.spreadsheet_id,
                                    range=score_range
                                ).execute()
                                
                                score_values = score_result.get('values', [])
                                if score_values and score_values[0]:
                                    scores = [1 if str(val).strip() == '1' or str(val).strip().lower() == 'true' else 0 
                                            for val in score_values[0]]
                                else:
                                    scores = [0] * 10
                                    
                                stakeholder['scores'][category_name] = scores
                            except Exception as e:
                                print(f"Error loading scores for {category_name}: {e}")
                                stakeholder['scores'][category_name] = [0] * 10
                        
                        self.stakeholders_data.append(stakeholder)
                
                self.root.after(0, self.render_stakeholders)
                self.root.after(0, lambda: self.status_var.set(f"Loaded {len(self.stakeholders_data)} stakeholders"))
                
            except Exception as e:
                self.root.after(0, lambda: messagebox.showerror("Error", f"Failed to load from Google Sheets: {e}"))
                self.root.after(0, lambda: self.status_var.set("Error loading data"))
        
        threading.Thread(target=load_thread, daemon=True).start()

    def save_to_sheets(self):
        """Save data to Google Sheets"""
        if not self.service:
            messagebox.showerror("Error", "Google Sheets API not available. Please check your credentials.")
            return
            
        def save_thread():
            try:
                self.status_var.set("Saving to Google Sheets...")
                self.root.update()
                
                for stakeholder in self.stakeholders_data:
                    # Update scores for each category
                    for category_name, category_config in self.categories.items():
                        scores = stakeholder['scores'].get(category_name, [0] * 10)
                        
                        # Prepare values for the range
                        values = [[str(score) for score in scores]]
                        
                        # Update the scores
                        range_name = f"{self.current_sheet}!{category_config['start_col']}{stakeholder['row']}:{category_config['end_col']}{stakeholder['row']}"
                        
                        self.service.spreadsheets().values().update(
                            spreadsheetId=self.spreadsheet_id,
                            range=range_name,
                            valueInputOption='RAW',
                            body={'values': values}
                        ).execute()
                        
                        # Update the total
                        total = sum(scores)
                        total_range = f"{self.current_sheet}!{category_config['total_col']}{stakeholder['row']}"
                        self.service.spreadsheets().values().update(
                            spreadsheetId=self.spreadsheet_id,
                            range=total_range,
                            valueInputOption='RAW',
                            body={'values': [[str(total)]]}
                        ).execute()
                
                self.root.after(0, lambda: messagebox.showinfo("Success", "Data saved to Google Sheets successfully!"))
                self.root.after(0, lambda: self.status_var.set("Data saved successfully"))
                
            except Exception as e:
                self.root.after(0, lambda: messagebox.showerror("Error", f"Failed to save to Google Sheets: {e}"))
                self.root.after(0, lambda: self.status_var.set("Error saving data"))
        
        threading.Thread(target=save_thread, daemon=True).start()

    def import_csv(self):
        """Import data from CSV file"""
        filename = filedialog.askopenfilename(
            title="Select CSV file",
            filetypes=[("CSV files", "*.csv"), ("All files", "*.*")]
        )
        
        if not filename:
            return
            
        try:
            with open(filename, 'r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                self.stakeholders_data = []
                
                for row in reader:
                    stakeholder = {
                        'name': row.get('Name', ''),
                        'sector': row.get('Sector', 'Unknown'),
                        'region': row.get('Region', 'Unknown'),
                        'row': len(self.stakeholders_data) + 2,
                        'scores': {}
                    }
                    
                    # Parse scores for each category
                    for category_name in self.categories.keys():
                        scores = []
                        for i in range(10):
                            key = f"{category_name} - {self.categories[category_name]['criteria'][i]}"
                            value = row.get(key, '0')
                            scores.append(1 if str(value).strip() == '1' else 0)
                        stakeholder['scores'][category_name] = scores
                    
                    self.stakeholders_data.append(stakeholder)
                
                self.render_stakeholders()
                self.status_var.set(f"Imported {len(self.stakeholders_data)} stakeholders from CSV")
                
        except Exception as e:
            messagebox.showerror("Error", f"Failed to import CSV: {e}")

    def export_csv(self):
        """Export data to CSV file"""
        filename = filedialog.asksaveasfilename(
            title="Save CSV file",
            defaultextension=".csv",
            filetypes=[("CSV files", "*.csv"), ("All files", "*.*")]
        )
        
        if not filename:
            return
            
        try:
            # Prepare headers
            headers = ['Name', 'Sector', 'Region']
            for category_name, category_config in self.categories.items():
                for criterion in category_config['criteria']:
                    headers.append(f"{category_name} - {criterion}")
                headers.append(f"{category_name} Total")
            
            # Write CSV
            with open(filename, 'w', newline='', encoding='utf-8') as file:
                writer = csv.writer(file)
                writer.writerow(headers)
                
                for stakeholder in self.stakeholders_data:
                    row = [stakeholder['name'], stakeholder['sector'], stakeholder['region']]
                    
                    for category_name in self.categories.keys():
                        scores = stakeholder['scores'].get(category_name, [0] * 10)
                        row.extend(scores)
                        row.append(sum(scores))
                    
                    writer.writerow(row)
            
            self.status_var.set(f"Exported {len(self.stakeholders_data)} stakeholders to CSV")
            messagebox.showinfo("Success", f"Data exported to {filename}")
            
        except Exception as e:
            messagebox.showerror("Error", f"Failed to export CSV: {e}")

    def render_stakeholders(self):
        """Render all stakeholders in the GUI"""
        # Clear existing widgets
        for widget in self.scrollable_frame.winfo_children():
            widget.destroy()
        
        filter_text = self.filter_var.get().lower()
        filtered_data = [s for s in self.stakeholders_data 
                        if filter_text in s['name'].lower()]
        
        for i, stakeholder in enumerate(filtered_data):
            self.create_stakeholder_widget(stakeholder, i)

    def create_stakeholder_widget(self, stakeholder, index):
        """Create widget for a single stakeholder"""
        # Main frame for stakeholder
        stakeholder_frame = ttk.LabelFrame(
            self.scrollable_frame, 
            text=f"{stakeholder['name']} ({stakeholder['sector']})",
            padding="10"
        )
        stakeholder_frame.grid(row=index, column=0, sticky=(tk.W, tk.E), pady=5, padx=5)
        
        # Create categories in a grid
        categories_frame = ttk.Frame(stakeholder_frame)
        categories_frame.grid(row=0, column=0, sticky=(tk.W, tk.E))
        
        for i, (category_name, category_config) in enumerate(self.categories.items()):
            category_frame = ttk.LabelFrame(categories_frame, text=category_name, padding="5")
            category_frame.grid(row=0, column=i, sticky=(tk.W, tk.E, tk.N, tk.S), padx=2)
            
            # Calculate total score
            scores = stakeholder['scores'].get(category_name, [0] * 10)
            total = sum(scores)
            
            # Total score label
            total_label = ttk.Label(category_frame, text=f"Total: {total}/10", 
                                  font=('Arial', 10, 'bold'))
            total_label.grid(row=0, column=0, columnspan=2, pady=(0, 5))
            
            # Create checkboxes for each criterion
            for j, criterion in enumerate(category_config['criteria']):
                var = tk.BooleanVar(value=bool(scores[j]))
                
                def update_score(category=category_name, criterion_index=j, var=var, stakeholder=stakeholder):
                    scores = stakeholder['scores'].get(category, [0] * 10)
                    scores[criterion_index] = 1 if var.get() else 0
                    stakeholder['scores'][category] = scores
                    
                    # Update total
                    total = sum(scores)
                    # Find and update the total label
                    for widget in category_frame.winfo_children():
                        if isinstance(widget, ttk.Label) and widget.cget('text').startswith('Total:'):
                            widget.config(text=f"Total: {total}/10")
                            break
                
                var.trace('w', lambda *args, category=category_name, criterion_index=j, var=var, stakeholder=stakeholder: update_score())
                
                cb = ttk.Checkbutton(
                    category_frame, 
                    text=criterion, 
                    variable=var,
                    width=30
                )
                cb.grid(row=j+1, column=0, sticky=tk.W, pady=1)

    def filter_stakeholders(self, event=None):
        """Filter stakeholders based on search text"""
        self.render_stakeholders()

    def run(self):
        """Run the application"""
        self.root.mainloop()

if __name__ == "__main__":
    app = LocalScoreUpdater()
    app.run()
