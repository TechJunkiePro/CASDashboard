# Sample Data

Place your CAS PDF file here for testing.

## How to obtain a CAS PDF

1. Log in to **CAMS** (www.camsonline.com) or **KFintech** (mfs.kfintech.com)
2. Navigate to **CAS / Statement** section
3. Download the Consolidated Account Statement (CAS) PDF
4. Use the password provided during download (usually your email or PAN)

## Test with casparser

You can verify the parser independently:

```python
import casparser
result = casparser.read_cas_pdf("your_cas.pdf", password="yourpassword")
print(result)
```
