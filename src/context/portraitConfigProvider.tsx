import { createContext, useContext, ParentComponent } from "solid-js";
import { createStore } from "solid-js/store";

interface PortraitConfigState {
  modalOpen: boolean;
  includePortrait: boolean;
  boxType: string;
  portraitId?: string;
  // Add any additional fields needed for ImageCanvas
}

interface PortraitConfigContextValue {
  config: PortraitConfigState;
  setConfig: (state: Partial<PortraitConfigState>) => void;
}

const PortraitConfigContext = createContext<PortraitConfigContextValue>();

export const PortraitConfigProvider: ParentComponent = (props) => {
  const [config, setConfig] = createStore<PortraitConfigState>({
    modalOpen: false,
    includePortrait: true,
    boxType: "normal_small",
    portraitId: undefined,
  });

  const updateConfig = (updates: Partial<PortraitConfigState>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  return (
    <PortraitConfigContext.Provider value={{ config, setConfig: updateConfig }}>
      {props.children}
    </PortraitConfigContext.Provider>
  );
};

export const usePortraitConfig = () => {
  const context = useContext(PortraitConfigContext);
  if (!context) {
    throw new Error("usePortraitConfig must be used within a PortraitConfigProvider");
  }
  return context;
};