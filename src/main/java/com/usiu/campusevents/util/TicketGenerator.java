package com.usiu.campusevents.util;

import com.usiu.campusevents.entity.Event;
import com.usiu.campusevents.entity.Registration;

import javax.imageio.ImageIO;
import java.awt.AlphaComposite;
import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Font;
import java.awt.GradientPaint;
import java.awt.Graphics2D;
import java.awt.FontMetrics;
import java.awt.RenderingHints;
import java.awt.font.FontRenderContext;
import java.awt.font.TextLayout;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public final class TicketGenerator {

    private static final int WIDTH = 1400;
    private static final int HEIGHT = 700;
    private static final int STUB_WIDTH = 360;
    private static final int HEADER_HEIGHT = 132;

    private static final Color DARK_BLUE = new Color(0x0C1B3F);
    private static final Color BLUE = new Color(0x1E3A8A);
    private static final Color LIGHT_BLUE = new Color(0x5B74B7);
    private static final Color CREAM = new Color(0xFFFDF7);
    private static final Color CREAM_PANEL = new Color(0xF9EDDC);
    private static final Color DARK_CREAM = new Color(0xE4CB9D);
    private static final Color GOLD = new Color(0xD4AF37);
    private static final Color GOLD_DARK = new Color(0xB8860B);
    private static final Color INK = new Color(0x1F2937);
    private static final Color MUTED = new Color(0x6B7280);
    private static final Color WHITE = Color.WHITE;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("EEE, MMM d, yyyy");
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("hh:mm a");
    private static final Font FONT_BASE = new Font("Arial", Font.PLAIN, 18);
    private static final Font FONT_BOLD = new Font("Arial", Font.BOLD, 18);
    private static final Font FONT_MONO = new Font("Consolas", Font.BOLD, 20);

    private TicketGenerator() {
    }

    public static byte[] generate(Registration registration) throws IOException {
        BufferedImage image = new BufferedImage(WIDTH, HEIGHT, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = image.createGraphics();
        try {
            setup(g);
            drawBackground(g);
            drawHeader(g, registration);
            int mainRight = WIDTH - STUB_WIDTH;
            drawStub(g, registration, mainRight);
            drawMain(g, registration, mainRight);
        } finally {
            g.dispose();
        }
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(image, "png", out);
        return out.toByteArray();
    }

    private static void setup(Graphics2D g) {
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
        g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
    }

    private static void drawBackground(Graphics2D g) {
        g.setPaint(new GradientPaint(0, 0, new Color(0xFFFFFF), WIDTH, HEIGHT, CREAM));
        g.fillRect(0, 0, WIDTH, HEIGHT);

        g.setColor(new Color(0xEEF2FA));
        g.fillOval(-220, 320, 480, 480);
        g.fillOval(WIDTH - 300, 460, 420, 420);
        g.setColor(new Color(0xF9EDDC));
        g.fillOval(WIDTH - 560, -260, 480, 480);

        g.setColor(new Color(0x0C1B3F, true));
        g.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, 0.045f));
        g.setFont(new Font("Arial", Font.BOLD, 150));
        centerText(g, "USIU-AFRICA", WIDTH / 2.0, HEIGHT - 60);
        g.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, 1f));
    }

    private static void drawHeader(Graphics2D g, Registration registration) {
        g.setPaint(new GradientPaint(0, 0, DARK_BLUE, WIDTH, HEADER_HEIGHT, BLUE));
        g.fillRect(0, 0, WIDTH, HEADER_HEIGHT);

        BufferedImage logo = loadLogo();
        if (logo != null) {
            int logoHeight = 86;
            int logoWidth = (int) Math.round(logoHeight * ((double) logo.getWidth() / logo.getHeight()));
            g.drawImage(logo, 36, (HEADER_HEIGHT - logoHeight) / 2, logoWidth, logoHeight, null);
        } else {
            g.setColor(GOLD);
            g.setFont(new Font("Arial", Font.BOLD, 40));
            centerText(g, "USIU", 36 + 120, HEADER_HEIGHT / 2.0 + 14);
        }

        g.setColor(WHITE);
        g.setFont(new Font("Arial", Font.BOLD, 26));
        g.drawString("USIU-AFRICA CAMPUS EVENTS", 230, 58);

        g.setColor(GOLD);
        g.setFont(new Font("Arial", Font.BOLD, 15));
        g.drawString("EVENT ADMISSION TICKET", 230, 88);

        g.setColor(LIGHT_BLUE);
        g.setFont(new Font("Arial", Font.PLAIN, 12));
        g.drawString("One student per ticket - not transferable", 230, 110);

        g.setFont(FONT_MONO);
        g.setColor(GOLD);
        g.drawString("#" + registration.getId(), WIDTH - STUB_WIDTH - 40, 66);

        g.setColor(GOLD_DARK);
        g.fillRect(0, HEADER_HEIGHT - 4, WIDTH, 4);
    }

    private static void drawMain(Graphics2D g, Registration registration, int mainRight) {
        Event event = registration.getEvent();
        int x = 44;
        int contentWidth = mainRight - x - 44;

        g.setColor(GOLD_DARK);
        g.setFont(new Font("Arial", Font.BOLD, 16));
        g.drawString("EVENT", x, 190);

        g.setColor(DARK_BLUE);
        g.setFont(new Font("Arial", Font.BOLD, 44));
        drawWrappedText(g, event.getTitle(), x, 228, contentWidth, 52, 2);

        g.setColor(new Color(0xB6C3E3));
        g.fillRect(x, 300, contentWidth, 3);

        int boxHeight = 96;
        int gap = 16;
        int boxWidth = (contentWidth - gap * 3) / 4;
        int boxY = 336;
        drawDetailBox(g, x, boxY, boxWidth, boxHeight, "DATE", event.getStartDateTime().format(DATE_FMT));
        drawDetailBox(g, x + boxWidth + gap, boxY, boxWidth, boxHeight, "TIME",
                event.getStartDateTime().format(TIME_FMT) + " - " + event.getEndDateTime().format(TIME_FMT));
        drawDetailBox(g, x + (boxWidth + gap) * 2, boxY, boxWidth, boxHeight, "VENUE",
                event.getVenue() != null ? event.getVenue().getVenueName() : "TBD");
        String organizedBy = event.getClub() != null
                ? event.getClub().getClubName()
                : event.getOrganizer().getFirstName() + " " + event.getOrganizer().getLastName();
        drawDetailBox(g, x + (boxWidth + gap) * 3, boxY, boxWidth, boxHeight, "ORGANIZED BY", organizedBy);

        int guestY = boxY + boxHeight + 44;
        g.setColor(GOLD_DARK);
        g.setFont(new Font("Arial", Font.BOLD, 16));
        g.drawString("ADMITTED GUEST", x, guestY);

        g.setColor(DARK_BLUE);
        g.setFont(new Font("Arial", Font.BOLD, 34));
        g.drawString(registration.getStudent().getFirstName() + " " + registration.getStudent().getLastName(), x, guestY + 42);

        g.setColor(MUTED);
        g.setFont(new Font("Arial", Font.PLAIN, 15));
        String studentLine = registration.getStudent().getRegistrationNumber() != null
                ? "Reg. No: " + registration.getStudent().getRegistrationNumber()
                : "USIU-Africa Student";
        g.drawString(studentLine, x, guestY + 70);

        String statusText = registration.getRegistrationStatus().name();
        Color statusBg = switch (registration.getRegistrationStatus()) {
            case REGISTERED -> new Color(0xD1FAE5);
            case WAITLISTED -> new Color(0xFEF3C7);
            case CANCELLED -> new Color(0xFEE2E2);
        };
        Color statusFg = switch (registration.getRegistrationStatus()) {
            case REGISTERED -> new Color(0x0F8A5F);
            case WAITLISTED -> new Color(0xB45309);
            case CANCELLED -> new Color(0xB91C1C);
        };
        int badgeWidth = textWidth(g, new Font("Arial", Font.BOLD, 15), statusText) + 36;
        int badgeX = mainRight - 44 - badgeWidth;
        g.setColor(statusBg);
        g.fillRect(badgeX, guestY - 6, badgeWidth, 30);
        g.setColor(statusFg);
        g.setFont(new Font("Arial", Font.BOLD, 15));
        centerInRect(g, statusText, badgeX, guestY - 6, badgeWidth, 30, 22);

        g.setColor(MUTED);
        g.setFont(new Font("Arial", Font.PLAIN, 14));
        g.drawString("Please present this ticket (digital or printed) at the venue entrance for check-in.", x, HEIGHT - 46);
    }

    private static void drawStub(Graphics2D g, Registration registration, int mainRight) {
        g.setStroke(new BasicStroke(2.5f, BasicStroke.CAP_BUTT, BasicStroke.JOIN_MITER, 10.0f, new float[]{14.0f, 12.0f}, 0));
        g.setColor(DARK_CREAM);
        g.drawLine(mainRight, 150, mainRight, HEIGHT - 150);

        int notchY1 = 200;
        int notchY2 = HEIGHT - 200;
        g.setColor(CREAM);
        g.fillOval(mainRight - 16, notchY1 - 16, 32, 32);
        g.fillOval(mainRight - 16, notchY2 - 16, 32, 32);
        g.setColor(DARK_CREAM);
        g.drawOval(mainRight - 16, notchY1 - 16, 32, 32);
        g.drawOval(mainRight - 16, notchY2 - 16, 32, 32);

        int sx = mainRight + 44;
        int stubWidth = WIDTH - sx - 40;

        g.setColor(DARK_BLUE);
        g.setFont(new Font("Arial", Font.BOLD, 22));
        centerText(g, "ADMIT ONE", sx + stubWidth / 2.0, 196);

        g.setColor(GOLD_DARK);
        g.setFont(new Font("Arial", Font.BOLD, 13));
        centerText(g, "S C A N   A T   T H E   D O O R", sx + stubWidth / 2.0, 224);

        int barWidth = stubWidth;
        int barHeight = 180;
        int barX = sx;
        int barY = 258;
        g.setColor(WHITE);
        g.fillRect(barX, barY, barWidth, barHeight);
        g.setColor(new Color(0x111827));
        drawBarcode(g, registration, barX, barY, barWidth, barHeight);

        g.setColor(MUTED);
        g.setFont(new Font("Arial", Font.PLAIN, 12));
        centerText(g, "BARCODE", sx + stubWidth / 2.0, barY + barHeight + 24);

        g.setColor(GOLD_DARK);
        g.setFont(new Font("Arial", Font.BOLD, 12));
        centerText(g, "VERIFICATION CODE", sx + stubWidth / 2.0, 500);

        g.setColor(DARK_BLUE);
        g.setFont(FONT_MONO);
        String code = verificationCode(registration);
        centerText(g, code, sx + stubWidth / 2.0, 540);

        g.setColor(MUTED);
        g.setFont(new Font("Arial", Font.PLAIN, 12));
        centerText(g, "Keep this slip for verification", sx + stubWidth / 2.0, 600);
    }

    private static void drawDetailBox(Graphics2D g, int x, int y, int w, int h, String label, String value) {
        g.setColor(CREAM_PANEL);
        g.fillRect(x, y, w, h);
        g.setColor(GOLD);
        g.fillRect(x, y, 5, h);
        g.setColor(MUTED);
        g.setFont(new Font("Arial", Font.BOLD, 12));
        g.drawString(label, x + 16, y + 26);
        g.setColor(DARK_BLUE);
        g.setFont(new Font("Arial", Font.BOLD, 17));
        g.drawString(value, x + 16, y + 56);
    }

    private static void drawBarcode(Graphics2D g, Registration registration, int x, int y, int w, int h) {
        long seed = registration.getId() * 7919L + registration.getEvent().getId() * 104729L;
        Random random = new Random(seed);
        g.setFont(new Font("Arial", Font.PLAIN, 1));
        int cursor = 6;
        while (cursor < w - 6) {
            int barW = 2 + random.nextInt(6);
            int gap = 2 + random.nextInt(4);
            if (cursor + barW > w - 6) {
                break;
            }
            g.fillRect(x + cursor, y, barW, h);
            cursor += barW + gap;
        }
    }

    private static String verificationCode(Registration registration) {
        return String.format("USIU-%d-%d-%d", registration.getEvent().getId(), registration.getStudent().getId(), registration.getId());
    }

    private static void drawWrappedText(Graphics2D g, String text, int x, int y, int maxWidth, int lineHeight, int maxLines) {
        FontMetrics fm = g.getFontMetrics();
        String[] words = text.split(" ");
        List<String> lines = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        for (String word : words) {
            String candidate = current.isEmpty() ? word : current + " " + word;
            if (fm.stringWidth(candidate) > maxWidth && !current.isEmpty()) {
                lines.add(current.toString());
                current = new StringBuilder(word);
                if (lines.size() == maxLines) {
                    break;
                }
            } else {
                current = new StringBuilder(candidate);
            }
        }
        if (current.length() > 0 && lines.size() < maxLines) {
            lines.add(current.toString());
        }
        if (lines.isEmpty()) {
            lines.add(text);
        }
        if (lines.size() == maxLines && fm.stringWidth(text) > maxWidth) {
            String last = lines.get(lines.size() - 1);
            while (!last.isEmpty() && fm.stringWidth(last + "...") > maxWidth) {
                last = last.substring(0, last.length() - 1);
            }
            lines.set(lines.size() - 1, last + "...");
        }
        int yy = y;
        for (String line : lines) {
            g.drawString(line, x, yy);
            yy += lineHeight;
        }
    }

    private static int textWidth(Graphics2D g, Font font, String text) {
        FontRenderContext ctx = g.getFontRenderContext();
        return (int) Math.ceil(new TextLayout(text, font, ctx).getBounds().getWidth());
    }

    private static void centerText(Graphics2D g, String text, double centerX, double baselineY) {
        FontMetrics fm = g.getFontMetrics();
        g.drawString(text, (float) (centerX - fm.stringWidth(text) / 2.0), (float) baselineY);
    }

    private static void centerInRect(Graphics2D g, String text, int x, int y, int w, int h, int baselineOffset) {
        FontMetrics fm = g.getFontMetrics();
        g.drawString(text, x + (w - fm.stringWidth(text)) / 2, y + baselineOffset);
    }

    private static BufferedImage loadLogo() {
        try (InputStream in = TicketGenerator.class.getResourceAsStream("/ticket/usiu-logo.png")) {
            if (in == null) {
                return null;
            }
            BufferedImage img = ImageIO.read(in);
            if (img == null) {
                return null;
            }
            return img;
        } catch (IOException e) {
            return null;
        }
    }
}
