<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Certificate of Achievement</title>
    <style>
        @page {
            margin: 0;
            size: A4 landscape;
        }
        body {
            margin: 0;
            padding: 0;
            font-family: 'Helvetica', 'Arial', sans-serif;
            color: #1a1e24;
            background-color: #fdfdfd;
            width: 100%;
            height: 100%;
            position: relative;
        }

        /* --- CORNER GRAPHICS USING CSS TRIANGLES --- */
        
        /* Bottom Left */
        .bl-shape { position: absolute; bottom: 0; left: 0; width: 0; height: 0; z-index: -1; }
        .bl-4 { border-bottom: 250px solid #d4af37; border-right: 250px solid transparent; }
        .bl-3 { border-bottom: 235px solid #fdfdfd; border-right: 235px solid transparent; }
        .bl-2 { border-bottom: 215px solid #d4af37; border-right: 215px solid transparent; }
        .bl-1 { border-bottom: 200px solid #1a1e24; border-right: 200px solid transparent; }

        /* Top Right */
        .tr-shape { position: absolute; top: 0; right: 0; width: 0; height: 0; z-index: -1; }
        .tr-4 { border-top: 250px solid #d4af37; border-left: 250px solid transparent; }
        .tr-3 { border-top: 235px solid #fdfdfd; border-left: 235px solid transparent; }
        .tr-2 { border-top: 215px solid #d4af37; border-left: 215px solid transparent; }
        .tr-1 { border-top: 200px solid #1a1e24; border-left: 200px solid transparent; }

        /* Top Left */
        .tl-shape { position: absolute; top: 0; left: 0; width: 0; height: 0; z-index: -1; }
        .tl-2 { border-top: 130px solid #d4af37; border-right: 130px solid transparent; }
        .tl-1 { border-top: 115px solid #1a1e24; border-right: 115px solid transparent; }

        /* Bottom Right */
        .br-shape { position: absolute; bottom: 0; right: 0; width: 0; height: 0; z-index: -1; }
        .br-2 { border-bottom: 130px solid #d4af37; border-left: 130px solid transparent; }
        .br-1 { border-bottom: 115px solid #1a1e24; border-left: 115px solid transparent; }

        /* --- CONTENT --- */
        .content {
            margin: 0 80px;
            padding-top: 50px;
            text-align: center;
            z-index: 10;
        }
        
        .school-name {
            font-size: 14px;
            font-weight: bold;
            color: #d4af37;
            text-transform: uppercase;
            letter-spacing: 3px;
            margin-bottom: 10px;
        }
        
        .cert-title {
            font-size: 50px;
            font-weight: 900;
            letter-spacing: 3px;
            text-transform: uppercase;
            color: #1a1e24;
            margin: 0;
            line-height: 1;
        }
        .cert-subtitle {
            font-size: 16px;
            font-weight: normal;
            letter-spacing: 5px;
            text-transform: uppercase;
            color: #333;
            margin-top: 12px;
        }
        .presented-to {
            margin-top: 40px;
            font-size: 11px;
            font-weight: bold;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
            line-height: 1.5;
        }
        .name {
            margin-top: 25px;
            font-size: 54px;
            font-family: 'Times New Roman', Times, serif;
            font-style: italic;
            font-weight: bold;
            color: #1a1e24;
            border-bottom: 2px solid #1a1e24;
            display: inline-block;
            padding-bottom: 5px;
            min-width: 450px;
        }
        .award-title {
            margin-top: 35px;
            font-size: 15px;
            font-weight: bold;
            color: #1a1e24;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .reason {
            margin-top: 10px;
            font-size: 12px;
            color: #666;
            line-height: 1.6;
            max-width: 550px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .footer {
            margin-top: 55px;
            width: 100%;
            display: table;
        }
        .signature-block {
            display: table-cell;
            width: 33.33%;
            text-align: center;
            vertical-align: bottom;
        }
        .signature-name {
            font-family: 'Times New Roman', Times, serif;
            font-style: italic;
            font-size: 24px;
            color: #1a1e24;
            margin-bottom: 5px;
        }
        .signature-date {
            font-family: 'Times New Roman', Times, serif;
            font-style: italic;
            font-size: 20px;
            color: #1a1e24;
            margin-bottom: 5px;
        }
        .signature-line {
            width: 180px;
            border-bottom: 1px solid #1a1e24;
            margin: 0 auto;
            margin-bottom: 8px;
        }
        .signature-title {
            font-size: 11px;
            font-weight: bold;
            color: #1a1e24;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
    </style>
</head>
<body>

    <!-- CSS Triangle Corners (DomPDF compatible) -->
    <!-- Bottom Left -->
    <div class="bl-shape bl-4" style="z-index: -4;"></div>
    <div class="bl-shape bl-3" style="z-index: -3;"></div>
    <div class="bl-shape bl-2" style="z-index: -2;"></div>
    <div class="bl-shape bl-1" style="z-index: -1;"></div>

    <!-- Top Right -->
    <div class="tr-shape tr-4" style="z-index: -4;"></div>
    <div class="tr-shape tr-3" style="z-index: -3;"></div>
    <div class="tr-shape tr-2" style="z-index: -2;"></div>
    <div class="tr-shape tr-1" style="z-index: -1;"></div>

    <!-- Top Left -->
    <div class="tl-shape tl-2" style="z-index: -2;"></div>
    <div class="tl-shape tl-1" style="z-index: -1;"></div>

    <!-- Bottom Right -->
    <div class="br-shape br-2" style="z-index: -2;"></div>
    <div class="br-shape br-1" style="z-index: -1;"></div>

    <!-- Content -->
    <div class="content">
        <div class="school-name">
            {{ $settings['school_name'] ?? config('app.name', 'Library System') }}
        </div>
        
        <div class="header">
            <h1 class="cert-title">CERTIFICATE</h1>
            <div class="cert-subtitle">OF APPRECIATION</div>
        </div>
        
        <div class="presented-to">
            This certificate is proudly presented for<br>
            honorable achievement to
        </div>
        
        <div class="name">
            {{ $student->name }}
        </div>
        
        <div class="award-title">
            "Most Outstanding Reader"
        </div>
        
        <div class="reason">
            In recognition of outstanding dedication to reading, maintaining an excellent library record,<br>
            and demonstrating a true passion for continuous learning.
        </div>
        
        <div class="footer">
            <div class="signature-block">
                <div class="signature-date">{{ date('F d, Y') }}</div>
                <div class="signature-line"></div>
                <div class="signature-title">Date</div>
            </div>
            
            <div class="signature-block">
                <div class="signature-name">{{ $settings['school_head_name'] ?? 'Admin' }}</div>
                <div class="signature-line"></div>
                <div class="signature-title">{{ $settings['school_head_role'] ?? 'School Principal' }}</div>
            </div>
            
            <div class="signature-block">
                <div class="signature-name">{{ $settings['librarian_name'] ?? 'Librarian' }}</div>
                <div class="signature-line"></div>
                <div class="signature-title">Librarian</div>
            </div>
        </div>
    </div>
</body>
</html>
