import { useEffect } from "react";
import { useColorMode } from "@chakra-ui/react";
import useSearchParams from "../hooks/useSearchParams";
import useEmbedStore from "../stores/embed";
import useThemeStore from "../stores/theme";
import { EmbedProps } from "./types";

export default function Embed({ children }: EmbedProps) {
  const {
    importerId,
    darkMode: darkModeString,
    primaryColor,
    metadata,
    template,
    isModal,
    isOpen, // Deprecated: use modalIsOpen
    modalIsOpen,
    onComplete,
    waitOnComplete,
    customStyles,
    showImportLoadingStatus,
    skipHeaderRowSelection,
    cssOverrides,
    schemaless,
    schemalessReadOnly,
    showDownloadTemplateButton,
  } = useSearchParams();

  // Set importerId & metadata in embed store
  const setEmbedParams = useEmbedStore((state) => state.setEmbedParams);
  const strToBoolean = (str: string) => !!str && (str.toLowerCase() === "true" || str === "1");
  const strToOptionalBoolean = (str: string) => (str ? str.toLowerCase() === "true" || str === "1" : undefined);
  const strToDefaultBoolean = (str: string, defaultValue: boolean) => (str ? str.toLowerCase() === "true" || str === "1" : defaultValue);
  const validateJSON = (str: string, paramName: string) => {
    if (!str) {
      return "";
    }
    try {
      const obj = JSON.parse(str);
      return JSON.stringify(obj);
    } catch (e) {
      console.error(`The parameter ${paramName} could not be parsed as JSON`, e);
      return "";
    }
  };

  useEffect(() => {
    setEmbedParams({
      importerId,
      metadata: validateJSON(metadata, "metadata"),
      template: validateJSON(template, "template"),
      // If only the deprecated isOpen is provided, use that. Else, use modalIsOpen
      modalIsOpen: strToBoolean(modalIsOpen === "" && isOpen !== "" ? isOpen : modalIsOpen),
      onComplete: strToBoolean(onComplete),
      waitOnComplete: strToBoolean(waitOnComplete),
      showImportLoadingStatus: strToBoolean(showImportLoadingStatus),
      skipHeaderRowSelection: strToOptionalBoolean(skipHeaderRowSelection),
      isModal: strToDefaultBoolean(isModal, true),
      schemaless: strToOptionalBoolean(schemaless),
      schemalessReadOnly: strToOptionalBoolean(schemalessReadOnly),
      showDownloadTemplateButton: strToDefaultBoolean(showDownloadTemplateButton, true),
      cssOverrides: validateJSON(cssOverrides, "cssOverrides"),
    });
  }, [importerId, metadata]);

  // Set Light/Dark mode
  const darkMode = strToBoolean(darkModeString);
  const setTheme = useThemeStore((state) => state.setTheme);
  const { colorMode, toggleColorMode } = useColorMode();

  useEffect(() => {
    setTheme(darkMode ? "dark" : "light");
    if (darkMode && colorMode === "light") toggleColorMode();
    if (!darkMode && colorMode === "dark") toggleColorMode();
  }, [darkMode]);

  // Apply primary color
  useEffect(() => {
    if (primaryColor) {
      const root = document.documentElement;
      root.style.setProperty("--color-primary", primaryColor);
    }
  }, [primaryColor]);

  // Apply custom CSS properties
  useEffect(() => {
    try {
      if (customStyles && customStyles !== "undefined") {
        const parsedStyles = JSON.parse(customStyles);

        if (customStyles && parsedStyles) {
          Object.keys(parsedStyles).forEach((key) => {
            const root = document.documentElement;
            const value = parsedStyles?.[key as any];
            root.style.setProperty("--" + key, value);
          });
        }
      }
    } catch (e) {
      console.error('The "customStyles" prop is not a valid JSON string. Please check the documentation for more details.');
    }
  }, [customStyles]);

  return <>{children}</>;
}
