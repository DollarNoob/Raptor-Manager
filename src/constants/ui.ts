export const UI_STYLES = {
  COLORS: {
    BACKGROUND_DARK: "oklch(0.24 0 0)",
    BACKGROUND_MEDIUM: "oklch(0.22 0 0)",
    BACKGROUND_LIGHT: "oklch(0.4 0 0)",
    TEXT_BRIGHT: "oklch(0.9 0 0)",
    TEXT_MEDIUM: "oklch(0.6 0 0)",
    BORDER: "#FFFFFF20",
    RED: "red",
    GREEN: "green",
    BLUE: "blue",
  },

  TYPOGRAPHY: {
    FONT_FAMILY_AVENIR: "Avenir",
    FONT_SIZE_SMALL: 12,
    FONT_SIZE_NORMAL: 14,
    FONT_SIZE_LARGE: 20,
    FONT_WEIGHT_NORMAL: 500,
    FONT_WEIGHT_MEDIUM: 700,
    FONT_WEIGHT_BOLD: 700,
  },

  SPACING: {
    TINY: 4,
    SMALL: 6,
    MEDIUM: 8,
    LARGE: 10,
    XLARGE: 12,
  },

  DIMENSIONS: {
    BUTTON_HEIGHT: 30,
    INPUT_HEIGHT: 30,
    MODAL_MIN_WIDTH: 240,
    MODAL_BORDER_RADIUS: 12,
  },
} as const;

export const BUTTON_COLOR_THEMES = {
    default: {
        background: UI_STYLES.COLORS.BACKGROUND_MEDIUM,
        text: UI_STYLES.COLORS.TEXT_BRIGHT,
    },
    header: {
        background: (active: boolean) =>
            active ? UI_STYLES.COLORS.BACKGROUND_DARK : "oklch(0.24 0 0)",
        text: UI_STYLES.COLORS.TEXT_BRIGHT,
    },
    main: {
        red: "oklch(0.68 0.22 30)",
        green: "oklch(0.68 0.22 150)",
        darkgreen: "oklch(0.58 0.22 150)",
    } as const,
    settings: {
        red: "oklch(0.64 0.18 30)",
        green: "oklch(0.64 0.18 160)",
        blue: "oklch(0.64 0.18 260)",
    } as const,
    status: {
        red: "oklch(0.64 0.18 30)",
        green: "oklch(0.64 0.18 150)",
        orange: "oklch(0.64 0.18 60)",
    } as const,
};

export const STATUS_COLORS = {
    red: "oklch(0.64 0.18 30)",
    green: "oklch(0.64 0.18 150)",
    orange: "oklch(0.64 0.18 60)",
} as const;