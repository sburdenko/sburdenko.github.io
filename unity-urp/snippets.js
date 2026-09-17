/** HLSL and C# from the URP e-book, with the book's typos and bugs fixed (see errata notes). */

const HEADER = (name, props) => `Shader "CustomURP/${name}"
{
    Properties
    {${props}
    }
    SubShader
    {
        Tags { "RenderType" = "Opaque" "RenderPipeline" = "UniversalPipeline" }
        Pass
        {
            HLSLPROGRAM
            #pragma vertex vert
            #pragma fragment frag`;

export const SHADERS = {
  unlit: `${HEADER('Unlit', '')}
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"

            struct Attributes { float4 positionOS : POSITION; };
            struct Varyings { float4 positionHCS : SV_POSITION; };

            Varyings vert(Attributes IN)
            {
                Varyings OUT;
                OUT.positionHCS = TransformObjectToHClip(IN.positionOS.xyz);
                return OUT;
            }

            half4 frag() : SV_Target
            {
                return half4(1, 1, 1, 1);
            }
            ENDHLSL
        }
    }
}`,
  color: `${HEADER('UnlitColor', `
        [MainColor] _BaseColor("Base Color", Color) = (1, 1, 1, 1)`)}
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"

            struct Attributes { float4 positionOS : POSITION; };
            struct Varyings { float4 positionHCS : SV_POSITION; };

            CBUFFER_START(UnityPerMaterial)
                half4 _BaseColor;
            CBUFFER_END

            Varyings vert(Attributes IN)
            {
                Varyings OUT;
                OUT.positionHCS = TransformObjectToHClip(IN.positionOS.xyz);
                return OUT;
            }

            half4 frag() : SV_Target
            {
                return _BaseColor;
            }
            ENDHLSL
        }
    }
}`,
  texture: `${HEADER('UnlitTexture', `
        [MainColor] _BaseColor("Base Color", Color) = (1, 1, 1, 1)
        [MainTexture] _BaseMap("Base Map", 2D) = "white" {}`)}
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"

            struct Attributes { float4 positionOS : POSITION; float2 uv : TEXCOORD0; };
            struct Varyings { float4 positionHCS : SV_POSITION; float2 uv : TEXCOORD0; };

            TEXTURE2D(_BaseMap);
            SAMPLER(sampler_BaseMap);

            CBUFFER_START(UnityPerMaterial)
                half4 _BaseColor;
                float4 _BaseMap_ST;
            CBUFFER_END

            Varyings vert(Attributes IN)
            {
                Varyings OUT;
                OUT.positionHCS = TransformObjectToHClip(IN.positionOS.xyz);
                OUT.uv = TRANSFORM_TEX(IN.uv, _BaseMap);
                return OUT;
            }

            half4 frag(Varyings IN) : SV_Target
            {
                return SAMPLE_TEXTURE2D(_BaseMap, sampler_BaseMap, IN.uv);
            }
            ENDHLSL
        }
    }
}`,
  lit: `${HEADER('LitSimple', `
        [MainColor] _BaseColor("Base Color", Color) = (1, 1, 1, 1)
        [MainTexture] _BaseMap("Base Map", 2D) = "white" {}`)}
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"

            struct Attributes { float4 positionOS : POSITION; float3 normalOS : NORMAL; float2 uv : TEXCOORD0; };
            struct Varyings { float4 positionHCS : SV_POSITION; float2 uv : TEXCOORD0; half3 lightAmount : TEXCOORD2; };

            TEXTURE2D(_BaseMap);
            SAMPLER(sampler_BaseMap);

            CBUFFER_START(UnityPerMaterial)
                half4 _BaseColor;
                float4 _BaseMap_ST;
            CBUFFER_END

            Varyings vert(Attributes IN)
            {
                Varyings OUT;
                OUT.positionHCS = TransformObjectToHClip(IN.positionOS.xyz);
                OUT.uv = TRANSFORM_TEX(IN.uv, _BaseMap);
                VertexNormalInputs normals = GetVertexNormalInputs(IN.normalOS);
                Light light = GetMainLight();
                OUT.lightAmount = LightingLambert(light.color, light.direction, normals.normalWS);
                return OUT;
            }

            half4 frag(Varyings IN) : SV_Target
            {
                return SAMPLE_TEXTURE2D(_BaseMap, sampler_BaseMap, IN.uv) * half4(IN.lightAmount, 1);
            }
            ENDHLSL
        }
    }
}`,
  shadows: `${HEADER('SimpleShadows', `
        [MainColor] _BaseColor("Base Color", Color) = (1, 1, 1, 1)
        _ShadowStrength("Shadow Strength", Float) = 0.5`)}
            #pragma multi_compile _ _MAIN_LIGHT_SHADOWS _MAIN_LIGHT_SHADOWS_CASCADE _MAIN_LIGHT_SHADOWS_SCREEN
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"

            struct Attributes { float4 positionOS : POSITION; };
            struct Varyings { float4 positionCS : SV_POSITION; float4 shadowCoords : TEXCOORD3; };

            CBUFFER_START(UnityPerMaterial)
                half4 _BaseColor;
                float _ShadowStrength;
            CBUFFER_END

            Varyings vert(Attributes IN)
            {
                Varyings OUT;
                OUT.positionCS = TransformObjectToHClip(IN.positionOS.xyz);
                VertexPositionInputs positions = GetVertexPositionInputs(IN.positionOS.xyz);
                OUT.shadowCoords = GetShadowCoord(positions);
                return OUT;
            }

            half4 frag(Varyings IN) : SV_Target
            {
                half shadowAmount = MainLightRealtimeShadow(IN.shadowCoords);
                half strength = 1.0 - _ShadowStrength;
                return _BaseColor * max(strength, shadowAmount);
            }
            ENDHLSL
        }
        // The book stops here: this shader receives shadows but casts none.
        UsePass "Universal Render Pipeline/Lit/ShadowCaster"
    }
}`,
};

export const SNIPPETS = {
  renderingLayers: `Renderer renderer = GetComponent<Renderer>();
int layerID = 1;
renderer.renderingLayerMask = (uint)(1 << layerID);`,

  autoLoadAsset: `[ExecuteAlways]
public class AutoLoadPipelineAsset : MonoBehaviour
{
    public UniversalRenderPipelineAsset pipelineAsset;

    void OnEnable()
    {
        if (pipelineAsset)
        {
            GraphicsSettings.defaultRenderPipeline = pipelineAsset;
            QualitySettings.renderPipeline = pipelineAsset;
        }
    }
}`,

  renderGraph: `public override void RecordRenderGraph(RenderGraph renderGraph, ContextContainer frameData)
{
    UniversalResourceData resourceData = frameData.Get<UniversalResourceData>();
    var desc = renderGraph.GetTextureDesc(resourceData.activeColorTexture);
    desc.name = "_TempColorCopy";
    TextureHandle copiedColor = renderGraph.CreateTexture(desc);

    using (var builder = renderGraph.AddRasterRenderPass<PassData>(m_PassName + "_CopyPass", out var passData, m_Sampler))
    {
        passData.source = resourceData.activeColorTexture;
        builder.UseTexture(resourceData.activeColorTexture, AccessFlags.Read);   // texture read: breaks merging
        builder.SetRenderAttachment(copiedColor, 0, AccessFlags.Write);
        builder.SetRenderFunc((PassData data, RasterGraphContext ctx) => ExecuteCopyColorPass(ctx.cmd, data.source));
    }

    using (var builder = renderGraph.AddRasterRenderPass<PassData>(m_PassName + "_FullScreenPass", out var passData, m_Sampler))
    {
        passData.material = m_Material;
        builder.UseTexture(copiedColor, AccessFlags.Read);
        builder.SetRenderAttachment(resourceData.activeColorTexture, 0, AccessFlags.Write);
        builder.SetRenderFunc((PassData data, RasterGraphContext ctx) => ExecuteMainPass(ctx.cmd, data.material));
    }
}`,
  renderGraphFetch: `// Framebuffer fetch version: the previous result is read from tile memory
builder.SetInputAttachment(resourceData.activeColorTexture, 0);   // copy pass
builder.SetInputAttachment(copiedColor, 0);                         // full-screen pass

// in ExecuteCopyColorPass the Blit becomes a procedural draw of pass 1 of FrameBufferFetch
cmd.DrawProcedural(Matrix4x4.identity, s_FrameBufferFetchMaterial, 1, MeshTopology.Triangles, 3, 1, null);`,

  volumeCode: `Volume volume = GetComponent<Volume>();
if (volume.profile.TryGet<Bloom>(out var bloom))
{
    bloom.intensity.value = 0;
}
if (volume.profile.TryGet<Vignette>(out var vignette))
{
    vignette.color.value = Color.red;   // e.g. flash on damage
}`,
  stackCode: `Camera baseCamera = GetComponent<Camera>();
var cameraData = baseCamera.GetUniversalAdditionalCameraData();
cameraData.cameraStack.Add(overlayCamera);
cameraData.cameraStack.Remove(overlayCamera);`,
  renderRequest: `void RenderRequest()
{
    Camera cam = GetComponent<Camera>();
    var request = new RenderPipeline.StandardRequest();
    if (RenderPipeline.SupportsRenderRequest(cam, request))
    {
        request.destination = renderTexture;
        RenderPipeline.SubmitRenderRequest(cam, request);
        Texture2D tex = ToTexture2D(renderTexture);
        SaveTexture(tex);
        Destroy(tex);   // the book destroys it inside ToTexture2D, before it is saved
    }
}`,

  pso: `var collection = new GraphicsStateCollection();
collection.BeginTrace();
// … play representative content on the target device and graphics API …
collection.EndTrace();
collection.SaveToFile(path);            // or SendToEditor() over Player Connection

// next launch, during loading
JobHandle handle = collection.WarmUp();                  // everything
JobHandle sliced = collection.WarmUpProgressively(8);    // a few PSOs per call`,
};
