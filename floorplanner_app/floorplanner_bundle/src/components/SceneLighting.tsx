import { useStore } from '../store/useStore';

export function SceneLighting() {
  const { sceneConfig, isNightMode } = useStore();

  // Night mode dims ambient/directional dramatically so fixture lights shine
  const nightFactor = isNightMode ? 0.05 : 1;
  const ambientInt = sceneConfig.ambientLightIntensity * nightFactor;
  const dirInt = sceneConfig.directionalLightIntensity * nightFactor;
  // A tiny moonlight blue tint at night
  const nightAmbientColor = isNightMode ? '#1a1a3a' : sceneConfig.ambientLightColor;

  return (
    <>
      <ambientLight
        intensity={isNightMode ? 0.02 : ambientInt}
        color={nightAmbientColor}
      />

      <directionalLight
        intensity={dirInt}
        color={isNightMode ? '#2a2a5a' : sceneConfig.directionalLightColor}
        position={sceneConfig.directionalLightPosition}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-bias={-0.0001}
      />

      {!isNightMode && (
        <directionalLight
          intensity={sceneConfig.directionalLightIntensity * 0.3}
          color="#b0c4de"
          position={[-5, 6, -3]}
        />
      )}

      {/* Point lights for interior — brighter at night to simulate always-on fixtures */}
      {sceneConfig.pointLights.map((light, i) => (
        <pointLight
          key={i}
          position={light.position}
          intensity={isNightMode ? light.intensity * 0.3 : light.intensity}
          color={light.color}
          distance={light.distance}
          castShadow
          shadow-mapSize-width={512}
          shadow-mapSize-height={512}
        />
      ))}

      <hemisphereLight
        intensity={isNightMode ? 0.02 : 0.3}
        color={isNightMode ? '#0a0a2a' : '#87CEEB'}
        groundColor={isNightMode ? '#0a0a0a' : '#8B7355'}
      />
    </>
  );
}
