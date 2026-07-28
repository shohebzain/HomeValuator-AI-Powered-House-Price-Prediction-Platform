import os
from fpdf import FPDF
from datetime import datetime
from typing import Dict, Any

class ValuationPDF(FPDF):
    def header(self):
        # Draw dark top banner
        self.set_fill_color(17, 24, 39)  # Slate Gray 900
        self.rect(0, 0, 210, 45, 'F')
        
        # Title
        self.set_y(10)
        self.set_font('helvetica', 'B', 22)
        self.set_text_color(255, 255, 255)
        self.cell(0, 10, 'PROPERTY VALUATION REPORT', align='C', new_x="LMARGIN", new_y="NEXT")
        
        # Subtitle
        self.set_font('helvetica', 'I', 10)
        self.set_text_color(156, 163, 175)  # gray 400
        self.cell(0, 6, 'AI-Powered Explainable Real Estate Analysis', align='C', new_x="LMARGIN", new_y="NEXT")
        
        # Reset colors for main document
        self.set_text_color(0, 0, 0)
        self.set_y(50)  # Move cursor past header banner

    def footer(self):
        self.set_y(-15)
        self.set_font('helvetica', 'I', 8)
        self.set_text_color(156, 163, 175)
        self.cell(0, 10, f'Page {self.page_no()}/{{nb}}  |  Generated on {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}  |  Confidential Analysis', align='C')

def generate_pdf_report(data: Dict[str, Any], filepath: str):
    pdf = ValuationPDF()
    pdf.alias_nb_pages()
    pdf.add_page()
    
    # 1. Summary Card / Executive Summary
    pdf.set_fill_color(243, 244, 246)  # gray 100
    pdf.rect(10, 50, 190, 32, 'F')
    
    pdf.set_y(54)
    pdf.set_x(15)
    pdf.set_font('helvetica', 'B', 12)
    pdf.set_text_color(31, 41, 55)  # gray 800
    pdf.cell(100, 6, "Estimated Market Value:")
    
    pdf.set_font('helvetica', 'B', 12)
    pdf.set_text_color(17, 24, 39)
    pdf.cell(80, 6, "Confidence Score:", align='R', new_x="LMARGIN", new_y="NEXT")
    
    pdf.set_x(15)
    pdf.set_font('helvetica', 'B', 24)
    pdf.set_text_color(37, 99, 235)  # blue 600
    pdf.cell(100, 10, f"${data['predicted_price']:,.2f}")
    
    pdf.set_font('helvetica', 'B', 24)
    # Color code confidence
    conf = data['confidence']
    if conf >= 90:
        pdf.set_text_color(22, 163, 74)  # green 600
    elif conf >= 80:
        pdf.set_text_color(217, 119, 6)  # amber 600
    else:
        pdf.set_text_color(220, 38, 38)  # red 600
    pdf.cell(80, 10, f"{conf}%", align='R', new_x="LMARGIN", new_y="NEXT")
    
    pdf.set_x(15)
    pdf.set_font('helvetica', 'I', 10)
    pdf.set_text_color(75, 85, 99)  # gray 600
    pdf.cell(100, 6, f"Price Category: {data['price_category']}")
    pdf.cell(80, 6, f"Estimated Range: {data.get('estimated_range', 'N/A')}", align='R', new_x="LMARGIN", new_y="NEXT")
    
    pdf.ln(10)
    
    # 2. Property Details (Grid Table)
    pdf.set_font('helvetica', 'B', 14)
    pdf.set_text_color(17, 24, 39)
    pdf.cell(0, 8, "1. Property Specifications", new_x="LMARGIN", new_y="NEXT")
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(4)
    
    pdf.set_font('helvetica', '', 10)
    props = data['property_details']
    
    spec_table = [
        ("Neighborhood", str(props.get("Neighborhood", "N/A")), "Living Area", f"{props.get('GrLivArea', 0):,.0f} sq.ft"),
        ("Lot Area", f"{props.get('LotArea', 0):,.0f} sq.ft", "Basement Area", f"{props.get('TotalBsmtSF', 0):,.0f} sq.ft"),
        ("Bedrooms", str(props.get("BedroomAbvGr", 0)), "Bathrooms", str(props.get("FullBath", 0))),
        ("Garage Capacity", f"{props.get('GarageCars', 0)} cars", "Garage Area", f"{props.get('GarageArea', 0):,.0f} sq.ft"),
        ("Year Built", str(props.get("YearBuilt", "N/A")), "Year Remodeled", str(props.get("YearRemodAdd", "N/A"))),
        ("Building Type", str(props.get("BldgType", "N/A")), "House Style", str(props.get("HouseStyle", "N/A"))),
        ("Overall Quality", f"{props.get('OverallQual', 0)} / 10", "Overall Condition", f"{props.get('OverallCond', 0)} / 10")
    ]
    
    # Render table
    pdf.set_fill_color(249, 250, 251)  # gray 50
    for col1_title, col1_val, col2_title, col2_val in spec_table:
        pdf.set_font('helvetica', 'B', 9)
        pdf.set_text_color(75, 85, 99)
        pdf.cell(35, 7, f"  {col1_title}", border=1, fill=True)
        pdf.set_font('helvetica', '', 9)
        pdf.set_text_color(17, 24, 39)
        pdf.cell(60, 7, f" {col1_val}", border=1)
        
        pdf.set_font('helvetica', 'B', 9)
        pdf.set_text_color(75, 85, 99)
        pdf.cell(35, 7, f"  {col2_title}", border=1, fill=True)
        pdf.set_font('helvetica', '', 9)
        pdf.set_text_color(17, 24, 39)
        pdf.cell(60, 7, f" {col2_val}", border=1, new_x="LMARGIN", new_y="NEXT")
        
    pdf.ln(10)
    
    # 3. AI Explainability (SHAP Contributions)
    pdf.set_font('helvetica', 'B', 14)
    pdf.set_text_color(17, 24, 39)
    pdf.cell(0, 8, "2. AI Valuation Drivers (Explainable SHAP Analysis)", new_x="LMARGIN", new_y="NEXT")
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(4)
    
    pdf.set_font('helvetica', '', 9.5)
    pdf.set_text_color(55, 65, 81)
    pdf.multi_cell(0, 5, "Below is the breakdown of how the key characteristics of the property influenced the AI's final price valuation relative to the typical baseline market price:")
    pdf.ln(4)
    
    shap_vals = data['shap_values']
    sorted_shap = sorted(shap_vals.items(), key=lambda x: x[1], reverse=True)
    
    # Separate positive and negative
    positive_drivers = [item for item in sorted_shap if item[1] > 0 and item[0] != 'Other Features']
    negative_drivers = [item for item in sorted_shap if item[1] < 0 and item[0] != 'Other Features']
    other_val = shap_vals.get('Other Features', 0.0)
    
    pdf.set_font('helvetica', 'B', 10)
    pdf.set_text_color(22, 163, 74) # green
    pdf.cell(0, 6, "Positive Value Drivers (Added Premium):", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font('helvetica', '', 9.5)
    pdf.set_text_color(31, 41, 55)
    
    if not positive_drivers:
        pdf.cell(0, 5, "  - None identified", new_x="LMARGIN", new_y="NEXT")
    else:
        for feat, val in positive_drivers[:5]:
            pdf.cell(0, 5, f"  + {feat}: +${val:,.2f}", new_x="LMARGIN", new_y="NEXT")
            
    pdf.ln(3)
    
    pdf.set_font('helvetica', 'B', 10)
    pdf.set_text_color(220, 38, 38) # red
    pdf.cell(0, 6, "Negative Value Drivers (Deductions):", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font('helvetica', '', 9.5)
    pdf.set_text_color(31, 41, 55)
    
    if not negative_drivers:
        pdf.cell(0, 5, "  - None identified", new_x="LMARGIN", new_y="NEXT")
    else:
        for feat, val in negative_drivers[:5]:
            pdf.cell(0, 5, f"  - {feat}: -${abs(val):,.2f}", new_x="LMARGIN", new_y="NEXT")
            
    if other_val != 0.0:
        pdf.ln(2)
        pdf.set_font('helvetica', 'I', 9.5)
        pdf.set_text_color(75, 85, 99)
        pdf.cell(0, 5, f"  Combined net impact of all other secondary features: {other_val:+.2f}", new_x="LMARGIN", new_y="NEXT")
        
    pdf.ln(10)
    
    # 4. Investment Analysis
    pdf.set_font('helvetica', 'B', 14)
    pdf.set_text_color(17, 24, 39)
    pdf.cell(0, 8, "3. Investment & ROI Outlook", new_x="LMARGIN", new_y="NEXT")
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(4)
    
    inv = data['investment_analysis']
    
    # Table of investment metrics
    inv_table = [
        ("Investment Score", f"{inv['investment_score']} / 100", "Indicates overall suitability for investment portfolio."),
        ("Market Health Score", f"{inv['market_score']} / 100", "Reflects neighborhood pricing trend and stability."),
        ("Resale Potential Score", f"{inv['resale_score']} / 100", "Expected liquidity and demand on future resale."),
        ("Investment Risk Score", f"{inv['risk_score']} / 100", "Overall risk (lower is safer; reflects age/condition)."),
        ("Projected 5-Yr ROI", f"{inv['roi_estimate']}%", "Projected total appreciation compound over 5 years."),
        ("Estimated Monthly Rent", f"${inv['rental_potential']:,.2f}/mo", "Estimated market rental cash flow capability.")
    ]
    
    pdf.set_fill_color(249, 250, 251)
    for metric, val, desc in inv_table:
        pdf.set_font('helvetica', 'B', 9)
        pdf.set_text_color(75, 85, 99)
        pdf.cell(45, 7, f"  {metric}", border=1, fill=True)
        
        pdf.set_font('helvetica', 'B', 10)
        # Highlight values
        if "Risk" in metric:
            try:
                score = float(val.split(" ")[0].replace("%", ""))
                if score > 60:
                    pdf.set_text_color(220, 38, 38)
                else:
                    pdf.set_text_color(22, 163, 74)
            except ValueError:
                pdf.set_text_color(75, 85, 99)
        elif "%" in val or " / 100" in val:
            try:
                score = float(val.split(" ")[0].replace("%", ""))
                if score >= 80:
                    pdf.set_text_color(22, 163, 74)
                elif score >= 65:
                    pdf.set_text_color(217, 119, 6)
                else:
                    pdf.set_text_color(220, 38, 38)
            except ValueError:
                pdf.set_text_color(75, 85, 99)
        else:
            pdf.set_text_color(37, 99, 235)
            
        pdf.cell(35, 7, f" {val}", border=1, align='C')
        
        pdf.set_font('helvetica', '', 8.5)
        pdf.set_text_color(75, 85, 99)
        pdf.cell(110, 7, f"  {desc}", border=1, new_x="LMARGIN", new_y="NEXT")
        
    # Disclaimer
    pdf.ln(12)
    pdf.set_font('helvetica', 'I', 7.5)
    pdf.set_text_color(107, 114, 128)
    pdf.multi_cell(0, 3.5, "Disclaimer: This valuation and analysis is generated dynamically by an artificial intelligence regression model trained on historic market transactions. No guarantee is made regarding accuracy. Real estate investments carry risk; you should conduct independent due diligence and consult with a licensed real estate professional before making any buying or selling decisions.")
    
    pdf.output(filepath)
