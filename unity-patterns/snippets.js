/** C# from the e-book, trimmed to the lines that carry the idea. Language-neutral, not translated. */

export const SNIPPETS = {
  'srp.before': `public class UnrefactoredPlayer : MonoBehaviour
{
    [SerializeField] private string inputAxisName;
    [SerializeField] private float positionMultiplier;
    private float yPosition;
    private AudioSource bounceSfx;

    private void Update()
    {
        float delta = Input.GetAxis(inputAxisName) * Time.deltaTime;
        yPosition = Mathf.Clamp(yPosition + delta, -1, 1);
        transform.position = new Vector3(transform.position.x,
            yPosition * positionMultiplier, transform.position.z);
    }

    private void OnTriggerEnter(Collider other)
    {
        bounceSfx.Play();
    }
}`,
  'srp.after': `[RequireComponent(typeof(PlayerAudio), typeof(PlayerInput),
    typeof(PlayerMovement))]
public class Player : MonoBehaviour
{
    [SerializeField] private PlayerAudio playerAudio;
    [SerializeField] private PlayerInput playerInput;
    [SerializeField] private PlayerMovement playerMovement;
}

public class PlayerAudio : MonoBehaviour { … }
public class PlayerInput : MonoBehaviour { … }
public class PlayerMovement : MonoBehaviour { … }
public class PlayerFX : MonoBehaviour { … }`,

  'ocp.before': `public class AreaCalculator
{
    public float GetRectangleArea(Rectangle rectangle)
    {
        return rectangle.width * rectangle.height;
    }

    public float GetCircleArea(Circle circle)
    {
        return circle.radius * circle.radius * Mathf.PI;
    }
    // every new shape = one more method here
}`,
  'ocp.after': `public abstract class Shape
{
    public abstract float CalculateArea();
}

public class Circle : Shape
{
    public float radius;
    public override float CalculateArea() => radius * radius * Mathf.PI;
}

public class AreaCalculator
{
    public float GetArea(Shape shape) => shape.CalculateArea();
}`,

  'lsp.before': `public class Vehicle
{
    public void GoForward() { … }
    public void Reverse() { … }
    public void TurnRight() { … }
    public void TurnLeft() { … }
}

public class Train : Vehicle { /* TurnLeft → NotImplementedException */ }

public class Navigator
{
    public void Move(Vehicle vehicle)
    {
        vehicle.GoForward();
        vehicle.TurnLeft();
        vehicle.GoForward();
    }
}`,
  'lsp.after': `public interface IMovable { void GoForward(); void Reverse(); }
public interface ITurnable { void TurnRight(); void TurnLeft(); }

public class RoadVehicle : IMovable, ITurnable { … }
public class RailVehicle : IMovable { … }

public class Car : RoadVehicle { … }
public class Train : RailVehicle { … }

public class Navigator
{
    public void Move(RoadVehicle vehicle) { … } // Train no longer fits
}`,

  'isp.before': `public interface IUnitStats
{
    float Health { get; set; }
    int Defense { get; set; }
    void Die();
    void TakeDamage();
    void RestoreHealth();
    float MoveSpeed { get; set; }
    float Acceleration { get; set; }
    void GoForward();
    void Reverse();
    void TurnLeft();
    void TurnRight();
    int Strength { get; set; }
    int Dexterity { get; set; }
    int Endurance { get; set; }
}`,
  'isp.after': `public interface IMovable { … }
public interface IDamageable
{
    float Health { get; set; }
    int Defense { get; set; }
    void Die();
    void TakeDamage();
    void RestoreHealth();
}
public interface IUnitStats { int Strength { get; set; } … }
public interface IExplodable
{
    float Mass { get; set; }
    float ExplosiveForce { get; set; }
    float FuseDelay { get; set; }
    void Explode();
}

public class ExplodingBarrel : MonoBehaviour, IDamageable, IExplodable { … }
public class EnemyUnit : MonoBehaviour, IDamageable, IMovable, IUnitStats { … }`,

  'dip.before': `public class Switch : MonoBehaviour
{
    public Door door;
    public bool isActivated;

    public void Toggle()
    {
        if (isActivated) { isActivated = false; door.Close(); }
        else { isActivated = true; door.Open(); }
    }
}`,
  'dip.after': `public interface ISwitchable
{
    bool IsActive { get; }
    void Activate();
    void Deactivate();
}

public class Switch : MonoBehaviour
{
    public ISwitchable client;

    public void Toggle()
    {
        if (client.IsActive) client.Deactivate();
        else client.Activate();
    }
}

public class Door : MonoBehaviour, ISwitchable { … }`,

  serializeInterface: `public class GameManager : MonoBehaviour
{
    [SerializeField] private MonoBehaviour interactableObject;

    private void Start()
    {
        if (interactableObject is IInteractable interactable)
            interactable.Interact();
    }
}`,

  factory: `public interface IProduct
{
    string ProductName { get; set; }
    void Initialize();
}

public abstract class Factory : MonoBehaviour
{
    public abstract IProduct GetProduct(Vector3 position);
}

public class ConcreteFactoryA : Factory
{
    [SerializeField] private ProductA productPrefab;

    public override IProduct GetProduct(Vector3 position)
    {
        GameObject instance = Instantiate(productPrefab.gameObject,
            position, Quaternion.identity);
        ProductA newProduct = instance.GetComponent<ProductA>();
        newProduct.Initialize();
        return newProduct;
    }
}`,
  factorySwitch: `public class Spawner : MonoBehaviour
{
    public void Spawn(string type, Vector3 position)
    {
        switch (type)
        {
            case "A": /* instantiate A, start particles */ break;
            case "B": /* instantiate B, play sound */ break;
            case "C": /* edit me for every new product */ break;
        }
    }
}`,

  poolManual: `public PooledObject GetPooledObject()
{
    if (stack.Count == 0)
    {
        PooledObject newInstance = Instantiate(objectToPool);
        newInstance.Pool = this;
        return newInstance;
    }
    PooledObject nextInstance = stack.Pop();
    nextInstance.gameObject.SetActive(true);
    return nextInstance;
}

public void ReturnToPool(PooledObject pooledObject)
{
    stack.Push(pooledObject);
    pooledObject.gameObject.SetActive(false);
}`,
  poolUnity: `using UnityEngine.Pool;

private IObjectPool<RevisedProjectile> objectPool;
[SerializeField] private bool collectionCheck = true;
[SerializeField] private int defaultCapacity = 20;
[SerializeField] private int maxSize = 100;

private void Awake()
{
    objectPool = new ObjectPool<RevisedProjectile>(
        CreateProjectile, OnGetFromPool, OnReleaseToPool,
        OnDestroyPooledObject, collectionCheck, defaultCapacity, maxSize);
}

private void OnReleaseToPool(RevisedProjectile p) => p.gameObject.SetActive(false);
private void OnGetFromPool(RevisedProjectile p) => p.gameObject.SetActive(true);
private void OnDestroyPooledObject(RevisedProjectile p) => Destroy(p.gameObject);`,

  singletonSimple: `public class SimpleSingleton : MonoBehaviour
{
    public static SimpleSingleton Instance;

    private void Awake()
    {
        if (Instance == null) Instance = this;
        else Destroy(gameObject);
    }
}`,
  singletonGeneric: `public class Singleton<T> : MonoBehaviour where T : Component
{
    private static T instance;

    public static T Instance
    {
        get
        {
            if (instance == null)
            {
                // the book uses FindObjectOfType, obsolete in Unity 6
                instance = FindAnyObjectByType<T>();
                if (instance == null) SetupInstance();
            }
            return instance;
        }
    }

    public virtual void Awake()
    {
        if (instance == null)
        {
            instance = this as T;
            DontDestroyOnLoad(gameObject);
        }
        else Destroy(gameObject);
    }

    private static void SetupInstance()
    {
        var gameObj = new GameObject(typeof(T).Name);
        instance = gameObj.AddComponent<T>();
        DontDestroyOnLoad(gameObj);
    }
}`,

  command: `public interface ICommand
{
    void Execute();
    void Undo();
}

public class MoveCommand : ICommand
{
    private readonly PlayerMover playerMover;
    private readonly Vector3 movement;

    public MoveCommand(PlayerMover player, Vector3 moveVector)
    {
        playerMover = player;
        movement = moveVector;
    }

    public void Execute() => playerMover.Move(movement);
    public void Undo() => playerMover.Move(-movement);
}

public class CommandInvoker
{
    private static Stack<ICommand> undoStack = new Stack<ICommand>();
    private static Stack<ICommand> redoStack = new Stack<ICommand>();

    public static void ExecuteCommand(ICommand command)
    {
        command.Execute();
        undoStack.Push(command);
        redoStack.Clear();
    }

    public static void UndoCommand()
    {
        if (undoStack.Count == 0) return;
        ICommand activeCommand = undoStack.Pop();
        redoStack.Push(activeCommand);
        activeCommand.Undo();
    }
}`,

  stateSwitch: `public enum PlayerControllerState { Idle, Walk, Jump }

private void Update()
{
    GetInput();
    switch (state)
    {
        case PlayerControllerState.Idle: Idle(); break;
        case PlayerControllerState.Walk: Walk(); break;
        case PlayerControllerState.Jump: Jump(); break;
    }
}`,
  statePattern: `public interface IState
{
    void Enter();
    void Execute();
    void Exit();
}

[Serializable]
public class StateMachine
{
    public IState CurrentState { get; private set; }

    public void Initialize(IState startingState)
    {
        CurrentState = startingState;
        startingState.Enter();
    }

    public void TransitionTo(IState nextState)
    {
        CurrentState.Exit();
        CurrentState = nextState;
        nextState.Enter();
    }

    public void Execute() => CurrentState?.Execute();
}

public class IdleState : IState
{
    private readonly PlayerController player;
    public IdleState(PlayerController player) => this.player = player;

    public void Enter() { }
    public void Execute()
    {
        if (!player.IsGrounded)
            player.StateMachine.TransitionTo(player.StateMachine.jumpState);
        else if (player.Velocity.sqrMagnitude > 0.01f)
            player.StateMachine.TransitionTo(player.StateMachine.walkState);
    }
    public void Exit() { }
}`,

  observer: `public class Subject : MonoBehaviour
{
    public event Action ThingHappened;

    public void DoThing() => ThingHappened?.Invoke();
}

public class Observer : MonoBehaviour
{
    [SerializeField] private Subject subjectToObserve;

    private void OnThingHappened() => Debug.Log("Observer responds");

    private void OnEnable()
    {
        if (subjectToObserve != null)
            subjectToObserve.ThingHappened += OnThingHappened;
    }

    private void OnDisable()
    {
        if (subjectToObserve != null)
            subjectToObserve.ThingHappened -= OnThingHappened;
    }
}`,

  mvp: `public class HealthModel : ScriptableObject
{
    public event Action HealthChanged;
    public int CurrentHealth;
    public string LabelName;
    public void Decrement(int amount) { … HealthChanged?.Invoke(); }
}

public class HealthPresenter : MonoBehaviour
{
    [SerializeField] private HealthModel m_HealthModelAsset;

    private void OnEnable()
    {
        m_HealthModelAsset.HealthChanged += OnHealthChanged;
        UpdateUI();
    }

    private void OnDisable() => m_HealthModelAsset.HealthChanged -= OnHealthChanged;
    private void OnHealthChanged() => UpdateUI();

    private void UpdateUI()
    {
        float healthPercentage = (float)m_HealthModelAsset.CurrentHealth
            / m_HealthModelAsset.MaxHealth;
        m_HealthBar.value = healthPercentage * 100;
        m_StatusLabel.text = healthPercentage switch
        {
            < 0.33f => "Danger",
            < 0.66f => "Neutral",
            _ => "Good"
        };
        m_ValueLabel.text = m_HealthModelAsset.CurrentHealth.ToString();
    }

    public void ApplyDamage(int damage) => m_HealthModelAsset.Decrement(damage);
}`,
  mvvm: `[InitializeOnLoadMethod]
public static void RegisterConverters()
{
    var converter = new ConverterGroup("Int to HealthBar");
    converter.AddConverter((ref int value) =>
        new StyleColor(Color.Lerp(Color.red, Color.green, value / (float)k_MaxHealth)));
    converter.AddConverter((ref int value) => (value / (float)k_MaxHealth) switch
    {
        < 1f / 3f => "Danger",
        < 2f / 3f => "Neutral",
        _ => "Good"
    });
    ConverterGroups.RegisterConverterGroup(converter);
}

private void SetDataBindings()
{
    var progress = m_Root.Q<ProgressBar>("health-bar")
        ?.Q<VisualElement>(className: "unity-progress-bar__progress");
    progress.dataSource = m_HealthModelAsset;
    var binding = new DataBinding
    {
        dataSourcePath = new PropertyPath(nameof(HealthModel.CurrentHealth)),
        bindingMode = BindingMode.ToTarget,
    };
    binding.sourceToUiConverters.AddConverter((ref int value) =>
        new StyleColor(Color.Lerp(Color.red, Color.green,
            (float)value / m_HealthModelAsset.MaxHealth)));
    progress.SetBinding("style.backgroundColor", binding);
}`,

  strategySwitch: `public class AbilityRunner : MonoBehaviour
{
    public enum Ability { RadarPulse, AirSupport, FirstAid }
    public Ability currentAbility;

    void ActivateAbility(Ability ability)
    {
        switch (ability)
        {
            case Ability.RadarPulse: Debug.Log("Activating Radar Pulse"); break;
            case Ability.AirSupport: Debug.Log("Calling in Air Support"); break;
            case Ability.FirstAid: Debug.Log("Using First Aid"); break;
        }
    }
}`,
  strategy: `public abstract class Ability : ScriptableObject
{
    public string abilityName;
    public abstract void Use(GameObject gameObject);
}

[CreateAssetMenu(fileName = "RadarPulseAbility", menuName = "Abilities/RadarPulse")]
public class RadarPulse : Ability
{
    public override void Use(GameObject gameObject) => Debug.Log("Activating Radar Pulse");
}

public class AbilityRunner : MonoBehaviour
{
    public Ability currentAbility;

    void Update()
    {
        if (Input.GetKeyDown(KeyCode.Space))
            currentAbility.Use(gameObject);
    }
}`,

  flyweight: `[CreateAssetMenu(fileName = "ShipData", menuName = "Flyweight/ShipData")]
public class ShipData : ScriptableObject
{
    public string UnitName;
    public string Description;
    public float Speed;
    public int AttackPower;
    public int Defense;
}

public class Ship : MonoBehaviour
{
    [SerializeField] private ShipData m_SharedData;
    [SerializeField] private float m_Health;

    public void Initialize(ShipData data, float health)
    {
        m_SharedData = data;
        m_Health = health;
    }
}`,

  dirty: `public class GameSectors : MonoBehaviour
{
    public Player player;
    public Sector[] sectors;

    private void Update()
    {
        foreach (Sector sector in sectors)
        {
            bool isPlayerClose = sector.IsPlayerClose(player.transform.position);

            if (isPlayerClose != sector.IsLoaded)
                sector.MarkDirty();

            if (sector.IsDirty)
            {
                if (isPlayerClose) sector.LoadContent();
                else sector.UnloadContent();
                sector.Clean();
            }
        }
    }
}`,
  dirtyLazy: `public class CachedTransform
{
    private readonly CachedTransform parent;
    private Matrix4x4 local, world;
    private bool dirty = true;

    public void SetLocal(Matrix4x4 value)
    {
        local = value;
        dirty = true;
    }

    public Matrix4x4 World
    {
        get
        {
            if (dirty)
            {
                world = parent == null ? local : parent.World * local;
                dirty = false;
            }
            return world;
        }
    }
}`,
};
